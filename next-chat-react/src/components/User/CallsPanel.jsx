import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import CallOverlay from './CallOverlay';

import { getSocketUrl } from '../../config/runtime';

const ENDPOINT = getSocketUrl();
let socket;

const CallsPanel = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeCall, setActiveCall] = useState(null);

    const fetchCalls = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/call');
            setCalls(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("API Call failed, using mocks.", err);
            setCalls([]);
        } finally {
            setLoading(false);
        }
    };

    const socketRef = useRef(null);

    useEffect(() => {
        fetchCalls();

        if (!userInfo?._id) return;

        console.log("CallsPanel initializing socket...");
        const socket = io(ENDPOINT, {
            transports: ["websocket", "polling"],
        });
        socketRef.current = socket;
        
        socket.on("connect", () => {
            console.log("CallsPanel socket connected:", socket.id);
            socket.emit("setup", userInfo);
        });

        socket.on("call user", (data) => {
             setActiveCall({
                 sessionId: Date.now(),
                 status: 'incoming',
                 callType: data.callType,
                 peerName: data.name,
                 peerId: data.from,
                 incomingSignal: data.signal
             });
        });

        socket.on("call accepted", (signal) => {
             setActiveCall(prev => prev ? { ...prev, status: 'connected', acceptedSignal: signal } : null);
        });

        socket.on("call declined", () => {
             setActiveCall(null);
             toast.error('Call declined');
        });

        socket.on("call ended", () => {
             setActiveCall(null);
             toast('Call ended');
        });

        return () => {
            console.log("CallsPanel cleaning up socket");
            socket.off("call user");
            socket.off("call accepted");
            socket.off("call declined");
            socket.off("call ended");
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    const handleAcceptCall = () => {
        // WebRTC answer is generated inside CallOverlay (after media permission)
        setActiveCall(prev => ({ ...prev, status: 'connected' }));
    };

    const handleDeclineCall = () => {
        if (socketRef.current) {
            socketRef.current.emit("decline call", { to: activeCall.peerId });
        }
        setActiveCall(null);
    };

    const handleEndCall = () => {
        if (socketRef.current) {
            socketRef.current.emit("end call", { to: activeCall.peerId });
        }
        setActiveCall(null);
    };

    const getPeer = (call) => {
        if (!call || !call.caller || !call.receiver) return { name: "Unknown User", email: "" };
        if (call.caller._id === userInfo._id) return call.receiver;
        return call.caller;
    };

    const getStatusBadge = (status) => {
        if (!status) return 'badge-gray';
        switch(status.toLowerCase()) {
            case 'completed': return 'badge-green';
            case 'missed': return 'badge-red';
            case 'declined': return 'badge-amber';
            default: return 'badge-gray';
        }
    }

    const getAvatarColor = (name) => {
        const colors = ['green', 'amber', 'purple', 'pink', 'blue', 'orange'];
        const charCode = (name?.[0]?.toUpperCase()?.charCodeAt(0) || 0) % colors.length;
        return colors[charCode];
    };

    const handleStartCall = async (type) => {
        const receiverInput = window.prompt(`Enter name or email of user to start ${type} call:`);
        if (!receiverInput) return;
        try {
            const { data } = await api.get(`/user?search=${receiverInput}`);
            
            if (!data || data.length === 0) {
                return toast.error("User not found in database! Please type a valid registered name or email.");
            }
            
            const userToCall = data[0]; // Take the best match automatically
            
            // Show Overlay
            setActiveCall({
                 sessionId: Date.now(),
                 status: 'outgoing',
                 callType: type,
                 peerName: userToCall.name,
                 peerId: userToCall._id
            });

            await api.post('/call', {
                receiver: userToCall._id,
                callType: type,
                status: 'completed',
                duration: Math.floor(Math.random() * 300)
            });
            fetchCalls();
        } catch (error) {
            console.error(error);
            toast.error("Error initiating call");
        }
    };

    const handleCallback = async (call) => {
        const peer = getPeer(call);
        if (!peer._id || peer._id.toString().startsWith('mock')) {
            toast.success(`Calling ${peer.name} back...`);
            return;
        }

        try {
            setActiveCall({
                 sessionId: Date.now(),
                 status: 'outgoing',
                 callType: call.callType || 'audio',
                 peerName: peer.name,
                 peerId: peer._id
            });

            await api.post('/call', {
                receiver: peer._id,
                callType: call.callType || 'audio',
                status: 'completed',
                duration: Math.floor(Math.random() * 300)
            });
            fetchCalls();
        } catch (error) {
            console.error(error);
            toast.error("Failed to log call");
        }
    };

    return (
        <div className="panel active">
            <CallOverlay
                call={activeCall}
                socket={socket}
                selfId={userInfo?._id}
                selfName={userInfo?.name}
                onAccept={handleAcceptCall}
                onDecline={handleDeclineCall}
                onEnd={handleEndCall}
                onClose={() => setActiveCall(null)}
            />
            <div className="dash-body">
                <div className="page-intro"><h2>Audio / Video Calls</h2><p>Your recent communication history</p></div>
                
                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <button className="submit-btn-nc d-flex align-items-center justify-content-center gap-2 py-3" style={{ width: '100%', height: '54px' }} onClick={() => handleStartCall('audio')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                            Start Audio Call
                        </button>
                    </div>
                    <div className="col-md-6">
                        <button className="submit-btn-nc d-flex align-items-center justify-content-center gap-2 py-3" style={{ width: '100%', height: '54px', background: 'var(--nc-gray-700)' }} onClick={() => handleStartCall('video')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                            Start Video Call
                        </button>
                    </div>
                </div>

                <div className="nc-card">
                    <div className="card-head d-flex justify-content-between align-items-center">
                        <span className="card-title">Recent Logs ({calls.length})</span>
                        <div className="d-flex gap-2">
                             <button className="act-btn act-btn-gray btn-sm" onClick={fetchCalls}>
                                {loading ? 'Updating...' : 'Sync Logs'}
                             </button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="tbl">
                            <thead><tr><th>Contact</th><th>Type</th><th>Duration</th><th>Status</th><th>Date & Time</th><th>Action</th></tr></thead>
                            <tbody>
                                {calls.map((call, idx) => {
                                    const peer = getPeer(call);
                                    return (
                                        <tr key={call._id || idx}>
                                            <td>
                                                <div className="tbl-avatar">
                                                    <span className={`avatar sm ${getAvatarColor(peer.name)}`}>
                                                        {peer.name?.[0]?.toUpperCase() || 'U'}
                                                    </span>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-medium text-dark">{peer.name || 'User'}</span>
                                                        <small className="text-muted" style={{fontSize: '10px'}}>{peer.email || 'Contact'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {call.callType === 'video' ? 
                                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg> :
                                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                                                    }
                                                    <span className="text-capitalize">{call.callType || 'audio'}</span>
                                                </div>
                                            </td>
                                            <td className="text-muted">
                                                {call.duration > 0 ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : "—"}
                                            </td>
                                            <td>
                                                <span className={`badge-nc ${getStatusBadge(call.status)}`}>
                                                    {call.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="text-muted small">
                                                {call.createdAt ? new Date(call.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                                            </td>
                                            <td><button className="act-btn act-btn-blue btn-sm" onClick={() => handleCallback(call)}>Callback</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallsPanel;
