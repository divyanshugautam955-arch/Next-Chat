import React, { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_RTC_CONFIG = {
    iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
        // Use environment variables for TURN credentials
        {
            urls: import.meta.env.VITE_TURN_URL || 'turn:global.relay.metered.ca:80',
            username: import.meta.env.VITE_TURN_USERNAME || '',
            credential: import.meta.env.VITE_TURN_PASSWORD || ''
        },
        // Optional: TCP variant for better firewall traversal
        {
            urls: (import.meta.env.VITE_TURN_URL || 'turn:global.relay.metered.ca:80') + '?transport=tcp',
            username: import.meta.env.VITE_TURN_USERNAME || '',
            credential: import.meta.env.VITE_TURN_PASSWORD || ''
        }
    ],
    iceCandidatePoolSize: 10,
};

const CallOverlay = ({ call, socket, selfId, selfName, onAccept, onDecline, onEnd, onClose }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const pcRef = useRef(null);
    const [mediaError, setMediaError] = useState(null);
    const [elapsedSec, setElapsedSec] = useState(0);

    const isVideo = useMemo(() => call?.callType === 'video', [call?.callType]);
    const sessionId = call?.sessionId;

    const startedOutgoingRef = useRef(false);
    const answeredIncomingRef = useRef(false);
    const appliedAnswerRef = useRef(false);
    const iceCandidateQueue = useRef([]);

    const cleanup = () => {
        startedOutgoingRef.current = false;
        answeredIncomingRef.current = false;
        appliedAnswerRef.current = false;
        setElapsedSec(0);

        try {
            if (pcRef.current) {
                pcRef.current.onicecandidate = null;
                pcRef.current.ontrack = null;
                pcRef.current.close();
            }
        } catch (err) {
            // ignore cleanup errors
        }
        pcRef.current = null;

        try {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
            }
        } catch (err) {
            // ignore cleanup errors
        }
        mediaStreamRef.current = null;

        try {
            if (remoteStreamRef.current) {
                remoteStreamRef.current.getTracks().forEach(t => t.stop());
            }
        } catch (err) {
            // ignore cleanup errors
        }
        remoteStreamRef.current = null;

        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
        setMediaError(null);
    };

    const formatDuration = (sec) => {
        const safe = Number.isFinite(sec) ? Math.max(0, sec) : 0;
        const m = Math.floor(safe / 60);
        const s = safe % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const ensurePeerConnection = () => {
        if (pcRef.current) return pcRef.current;
        const pc = new RTCPeerConnection(DEFAULT_RTC_CONFIG);
        pcRef.current = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate && socket && call?.peerId && selfId) {
                socket.emit('ice candidate', { to: call.peerId, from: selfId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log("Received remote track:", event.track.kind);
            if (!remoteStreamRef.current) {
                remoteStreamRef.current = new MediaStream();
            }
            remoteStreamRef.current.addTrack(event.track);
            
            // Re-assign srcObject to ensure the video/audio elements see the new track
            if (isVideo && remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStreamRef.current;
            }
            if (!isVideo && remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = remoteStreamRef.current;
                remoteAudioRef.current.play?.().catch(() => {});
            }
        };

        return pc;
    };

    const ensureLocalMedia = async () => {
        if (mediaStreamRef.current) return mediaStreamRef.current;
        const constraints = isVideo ? { video: true, audio: true } : { audio: true, video: false };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStreamRef.current = stream;
        if (localVideoRef.current && isVideo) {
            localVideoRef.current.srcObject = stream;
        }
        return stream;
    };

    const attachLocalTracks = async () => {
        const pc = ensurePeerConnection();
        if (pc.signalingState === 'closed') {
            throw new Error('Peer connection is closed');
        }
        const stream = await ensureLocalMedia();
        const existing = pc.getSenders().map(s => s.track).filter(Boolean);
        stream.getTracks().forEach(track => {
            if (!existing.includes(track)) pc.addTrack(track, stream);
        });
        return { pc, stream };
    };

    const processQueuedCandidates = async () => {
        const pc = pcRef.current;
        if (!pc || !pc.remoteDescription) return;
        while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error("Error adding queued candidate", e);
            }
        }
    };

    const startOutgoing = async () => {
        if (!socket || !call?.peerId || !selfId) return;
        if (startedOutgoingRef.current) return;
        startedOutgoingRef.current = true;

        const { pc } = await attachLocalTracks();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('call user', {
            userToCall: call.peerId,
            signalData: { sdp: pc.localDescription },
            from: selfId,
            name: selfName || 'User',
            callType: call.callType,
        });
    };

    const acceptIncoming = async () => {
        if (!socket || !call?.peerId || !selfId) return;
        if (answeredIncomingRef.current) return;

        const offerSdp = call?.incomingSignal?.sdp;
        if (!offerSdp) throw new Error('Missing incoming offer SDP');

        const { pc } = await attachLocalTracks();
        if (!pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
        }
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer call', { to: call.peerId, from: selfId, signal: { sdp: pc.localDescription } });
        answeredIncomingRef.current = true;
        await processQueuedCandidates();
    };

    const applyAcceptedAnswer = async () => {
        const answerSdp = call?.acceptedSignal?.sdp;
        if (!answerSdp) return;
        if (appliedAnswerRef.current) return;

        const pc = ensurePeerConnection();
        // Only apply answer when caller has local offer pending
        if (pc.currentRemoteDescription) {
            appliedAnswerRef.current = true;
            return;
        }
        if (pc.signalingState !== 'have-local-offer') return;

        await pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
        appliedAnswerRef.current = true;
        await processQueuedCandidates();
    };

    // Create/tear down the call resources once per session
    useEffect(() => {
        if (!call) return;
        if (!socket) return;
        if (!selfId) return;
        if (!sessionId) return;

        const onIce = async (data) => {
            try {
                if (!data?.candidate) return;
                if (!call?.peerId) return;
                if (data.from && data.from !== call.peerId) return;
                
                const pc = ensurePeerConnection();
                if (pc.signalingState === 'closed') return;

                if (pc.remoteDescription && pc.remoteDescription.type) {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } else {
                    iceCandidateQueue.current.push(data.candidate);
                }
            } catch (err) {
                console.error("Error adding ice candidate:", err);
            }
        };

        socket.on('ice candidate', onIce);

        return () => {
            socket.off('ice candidate', onIce);
            cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // Call timer: starts when connected
    useEffect(() => {
        if (!call) return;
        if (!sessionId) return;
        if (call.status !== 'connected') return;

        setElapsedSec(0);
        const id = setInterval(() => {
            setElapsedSec((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(id);
    }, [sessionId, call?.status]);

    // Outgoing: start offer exactly once
    useEffect(() => {
        if (!call) return;
        if (!socket) return;
        if (!selfId) return;
        if (!sessionId) return;
        if (call.status !== 'outgoing') return;

        startOutgoing().catch(err => setMediaError(err?.message || 'Failed to start call'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, call?.status]);

    // Caller: apply remote answer when received (and state is correct)
    useEffect(() => {
        if (!call) return;
        if (!sessionId) return;
        if (!call.acceptedSignal?.sdp) return;
        applyAcceptedAnswer().catch(err => setMediaError(err?.message || 'Failed to apply answer'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, call?.acceptedSignal]);

    useEffect(() => {
        // Ensure local preview for video once overlay shows outgoing/connected
        if (call && call.callType === 'video' && (call.status === 'connected' || call.status === 'outgoing')) {
            ensureLocalMedia().catch(err => setMediaError(err?.message || 'Media permission denied'));
        }
    }, [call]);

    if (!call) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
            zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
        }}>
            {/* Hidden remote audio sink for audio calls */}
            {call.callType === 'audio' && (
                <audio ref={remoteAudioRef} autoPlay playsInline />
            )}
            <div style={{
                width: '360px', height: '540px', background: 'var(--nc-gray-900)', borderRadius: '32px',
                padding: '30px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Video Background if Video Call (remote preferred, local fallback) */}
                {call.callType === 'video' && (call.status === 'connected' || call.status === 'outgoing') && (
                    <>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                objectFit: 'cover', zIndex: 0, opacity: call.status === 'connected' ? 1 : 0.5
                            }}
                        />
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                position: 'absolute', bottom: '18px', right: '18px', width: '110px', height: '160px',
                                objectFit: 'cover', zIndex: 2, borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                                opacity: call.status === 'connected' ? 1 : 0.75
                            }}
                        />
                    </>
                )}

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                        <div className="mb-4 position-relative">
                            <div className="avatar d-flex align-items-center justify-content-center text-white" 
                                 style={{ width: '110px', height: '110px', fontSize: '36px', background: 'var(--nc-primary)', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                                {call.peerName?.[0]?.toUpperCase()}
                            </div>
                            {(call.status === 'incoming' || call.status === 'outgoing') && (
                                <div className="pulse-ring"></div>
                            )}
                        </div>
                        
                        <h2 className="fw-bold mb-1" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{call.peerName}</h2>
                        <p className="text-white mb-4" style={{opacity: 0.8, textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '15px'}}>
                            {call.status === 'incoming' ? `Incoming ${call.callType} call...` : 
                             call.status === 'outgoing' ? `Ringing...` : 
                             formatDuration(elapsedSec)}
                        </p>

                        {mediaError && (
                            <p className="text-white mb-3" style={{ opacity: 0.9, fontSize: '12px', maxWidth: '280px' }}>
                                {mediaError}
                            </p>
                        )}
                    </div>

                    <div className="d-flex justify-content-center gap-4 pb-3">
                        {call.status === 'incoming' && (
                            <button className="btn d-flex align-items-center justify-content-center rounded-circle" 
                                    style={{ background: '#10b981', color: 'white', width: '64px', height: '64px', border: 'none', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
                                    onClick={async () => {
                                        onAccept?.();
                                        try {
                                            await acceptIncoming();
                                        } catch (err) {
                                            setMediaError(err?.message || 'Failed to accept call');
                                        }
                                    }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                            </button>
                        )}
                        <button className="btn d-flex align-items-center justify-content-center rounded-circle" 
                                style={{ background: '#ef4444', color: 'white', width: '64px', height: '64px', border: 'none', boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
                                onClick={() => {
                                    if (call.status === 'incoming') {
                                        onDecline?.();
                                    } else {
                                        onEnd?.();
                                    }
                                    cleanup();
                                    onClose?.();
                                }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-3.33-2.67m-2.67-3.33A19.79 19.79 0 011.93 5.06 2 2 0 014.11 3h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91m14.82 8.91l-21-21" /></svg>
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .pulse-ring {
                    content: '';
                    position: absolute;
                    top: -15px; left: -15px; right: -15px; bottom: -15px;
                    border: 3px solid rgba(255,255,255,0.5);
                    border-radius: 50%;
                    animation: pulse-ring 2s infinite cubic-bezier(0.25, 1, 0.5, 1);
                    pointer-events: none;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(1.3); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default CallOverlay;
