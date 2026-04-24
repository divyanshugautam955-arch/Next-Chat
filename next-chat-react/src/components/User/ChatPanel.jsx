import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import CallOverlay from './CallOverlay';
import { pushNotification } from '../../utils/notifications';
import { getApiOrigin, getSocketUrl } from '../../config/runtime';
import EmojiPicker from 'emoji-picker-react';
import { useSocket } from '../../context/SocketContext';

const ENDPOINT = getApiOrigin();
const SOCKET_ENDPOINT = getSocketUrl();
// We use a module-level variable for the socket to allow it to persist 
// somewhat between navigations if needed, but we'll manage it carefully.
let socketInstance; 

const ChatPanel = () => {
    const location = useLocation();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(location.state?.selectedChat || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [activeCall, setActiveCall] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    const safeUserName = userInfo?.name || "User";
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const defaultConversations = [];
    const defaultMessages = [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getAvatarColor = (name, isGroup) => {
        if (isGroup) return 'purple';
        const colors = ['green', 'amber', 'purple', 'pink', 'blue', 'orange'];
        const charCode = (name?.[0]?.toUpperCase()?.charCodeAt(0) || 0) % colors.length;
        return colors[charCode];
    };

    const { socket, onlineUsers: globalOnlineUsers } = useSocket();
    const socketRef = useRef(null);
    const selectedChatCompareRef = useRef(null);

    useEffect(() => {
        socketRef.current = socket;
    }, [socket]);

    useEffect(() => {
        setOnlineUsers(globalOnlineUsers);
    }, [globalOnlineUsers]);

    useEffect(() => {
        const messageHandler = (e) => {
            const newMessageRecieved = e.detail;
            console.log("ChatPanel caught message:", newMessageRecieved);
            const currentChat = selectedChatCompareRef.current;
            
            if (currentChat && currentChat._id === newMessageRecieved.chat._id) {
                setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
            } else {
                fetchChats();
            }
        };

        const incomingCallHandler = (data) => {
             setActiveCall({
                 sessionId: Date.now(),
                 status: 'incoming',
                 callType: data.callType,
                 peerName: data.name,
                 peerId: data.from,
                 incomingSignal: data.signal
             });
        };

        const callAcceptedHandler = (signal) => setActiveCall(prev => prev ? { ...prev, status: 'connected', acceptedSignal: signal } : null);
        const callDeclinedHandler = () => { setActiveCall(null); toast.error('Call declined'); };
        const callEndedHandler = () => { setActiveCall(null); toast('Call ended'); };

        window.addEventListener("nc:message_received", messageHandler);
        
        if (socket) {
            socket.on("call user", incomingCallHandler);
            socket.on("call accepted", callAcceptedHandler);
            socket.on("call declined", callDeclinedHandler);
            socket.on("call ended", callEndedHandler);
        }

        return () => {
            window.removeEventListener("nc:message_received", messageHandler);
            if (socket) {
                socket.off("call user", incomingCallHandler);
                socket.off("call accepted", callAcceptedHandler);
                socket.off("call declined", callDeclinedHandler);
                socket.off("call ended", callEndedHandler);
            }
        };
    }, [socket]);

    const handleAcceptCall = () => {
        // WebRTC answer is generated inside CallOverlay (after media permission)
        setActiveCall(prev => ({ ...prev, status: 'connected' }));
    };

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
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

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChats = async () => {
        try {
            const { data } = await api.get('/chat');
            setChats(Array.isArray(data) ? data : []);
        } catch (error) {
            setChats([]);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages();
            selectedChatCompareRef.current = selectedChat;
        }
    }, [selectedChat]);

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            setLoading(true);
            const { data } = await api.get(`/message/${selectedChat._id}`);
            setMessages(data);
            if (socketRef.current) {
                socketRef.current.emit("join chat", selectedChat._id);
            }
        } catch (error) {
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const isImageUrl = (url) => {
        if (!url) return false;
        const clean = url.split('?')[0].toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'].some(ext => clean.endsWith(ext));
    };

    const toAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${ENDPOINT}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const sendAttachmentMessage = async (attachmentUrl, fallbackText = "") => {
        if (!selectedChat) return;

        try {
            const { data } = await api.post('/message', {
                content: fallbackText,
                attachment: attachmentUrl,
                chatId: selectedChat._id
            });
            if (socketRef.current) {
                socketRef.current.emit("new message", data);
            }
            setMessages((prev) => [...prev, data]);
        } catch (error) {
            toast.error("Failed to send attachment");
        }
    };

    const handlePickFile = () => {
        if (!selectedChat) return toast.error("Select a chat first");
        if (uploading) return;
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (!selectedChat) return toast.error("Select a chat first");

        try {
            setUploading(true);
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post('/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = data?.url;
            if (!url) throw new Error("Upload did not return a URL");
            toast.success("Uploaded");
            await sendAttachmentMessage(url, file.name);
        } catch (error) {
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    const sendMessage = async (e) => {
        if (e.key === "Enter" || e.type === "click") {
            if (newMessage) {
                try {
                    const messageToSend = newMessage;
                    setNewMessage("");
                    const { data } = await api.post('/message', {
                        content: messageToSend,
                        chatId: selectedChat._id
                    });
                    if (socketRef.current) {
                        socketRef.current.emit("new message", data);
                    }
                    setMessages([...messages, data]);
                    setShowEmojiPicker(false); // Close picker on send
                } catch (error) {
                    toast.error("Failed to send message");
                }
            }
        }
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            setSearchResult([]);
            return;
        }
        try {
            const { data } = await api.get(`/user?search=${query}`);
            setSearchResult(data);
        } catch (error) {
            toast.error("Error searching users");
        }
    };

    const accessChat = async (userId) => {
        try {
            const { data } = await api.post('/chat', { userId });
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setSearchResult([]);
            setSearch("");
        } catch (error) {
            toast.error("Error creating chat");
        }
    };

    const getChatName = (chat) => {
        if (chat.isGroupChat) return chat.chatName;
        return chat.users.find(u => u._id !== userInfo._id)?.name || "User";
    };

    const isChatOnline = (chat) => {
        if (!chat) return false;
        if (chat.isGroupChat) {
            // For group chats, return true if ANY member (besides current user) is online
            return (chat.users || []).some(u => u._id !== userInfo?._id && onlineUsers.includes(u._id));
        }
        const other = (chat.users || []).find(u => u._id !== userInfo?._id);
        return other ? onlineUsers.includes(other._id) : false;
    };

    const getOnlineCount = (chat) => {
        if (!chat || !chat.isGroupChat) return 0;
        return (chat.users || []).filter(u => u._id !== userInfo?._id && onlineUsers.includes(u._id)).length;
    };

    const handleCall = async (type) => {
        if (!selectedChat) return;
        
        const peer = selectedChat.isGroupChat ? null : selectedChat.users.find(u => u._id !== userInfo._id);
        if (!peer && !selectedChat.isGroupChat) {
             toast.error("Cannot call this user");
             return;
        }
        
        setActiveCall({
             sessionId: Date.now(),
             status: 'outgoing',
             callType: type,
             peerName: selectedChat.isGroupChat ? selectedChat.chatName : peer.name,
             peerId: selectedChat.isGroupChat ? null : peer._id
        });

        try {
            if (!selectedChat.isGroupChat) {
                await api.post('/call', {
                    receiver: peer._id,
                    callType: type,
                    status: 'completed',
                    duration: Math.floor(Math.random() * 300)
                });
            }
        } catch (error) {
            console.error("Failed to log call", error);
        }
    };

    return (
        <div className="panel active">
            <CallOverlay
                call={activeCall}
                socket={socketRef.current}
                selfId={userInfo?._id}
                selfName={userInfo?.name}
                onAccept={handleAcceptCall}
                onDecline={handleDeclineCall}
                onEnd={handleEndCall}
                onClose={() => setActiveCall(null)}
            />
            <div className="d-flex chat-shell-wrap">
                {/* Conversation List */}
                <div className={`chat-sidebar-panel ${selectedChat ? 'hidden' : ''}`}>
                    <div className="p-2 border-bottom">
                        <div className="search-wrap d-flex align-items-center gap-2">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input 
                                type="text" 
                                placeholder="Search or start new chat…" 
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {searchResult.length > 0 && (
                        <div className="search-results border-bottom bg-white" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {searchResult.map((user) => (
                                <div key={user._id} className="conv-item cursor-pointer" onClick={() => accessChat(user._id)}>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className={`avatar sm ${getAvatarColor(user.name)}`}>{user.name.charAt(0).toUpperCase()}</span>
                                        <div className="conv-name">{user.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-bottom px-2 d-flex justify-content-between align-items-center">
                        <span className="chat-tab active">Messages</span>
                    </div>
                    <div style={{ overflowY: 'auto', height: 'calc(100% - 100px)' }}>
                        {chats.map((chat) => {
                            const chatName = getChatName(chat);
                            const avatarColor = chat.color || getAvatarColor(chatName, chat.isGroupChat);
                            return (
                                <div key={chat._id} 
                                     className={`conv-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                                     onClick={() => handleSelectChat(chat)}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="position-relative">
                                            <span className={`avatar sm ${avatarColor}`}>
                                                {chat.isGroupChat ? "#" : chatName.charAt(0).toUpperCase()}
                                            </span>
                                            <span className={`status-indicator ${isChatOnline(chat) ? 'online' : 'offline'}`}></span>
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <div className="d-flex justify-content-between">
                                                <div className="conv-name text-truncate" style={{maxWidth: '120px'}}>{chatName}</div>
                                                <div className="small text-muted" style={{fontSize: '10px'}}>{chat.time || (chat.latestMessage ? new Date(chat.latestMessage.createdAt).getHours() + ":" + new Date(chat.latestMessage.createdAt).getMinutes() : "")}</div>
                                            </div>
                                            <div className="conv-preview text-truncate">
                                                {chat.latestMessage
                                                    ? `${chat.latestMessage.sender?.name || "User"}: ${chat.latestMessage.content || ""}`
                                                    : "Start a conversation"}
                                            </div>
                                        </div>
                                        {chat.unread > 0 && <span className="badge-nc badge-green ms-auto" style={{fontSize: '9px', borderRadius: '50%', padding: '2px 5px'}}>{chat.unread}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Main Window */}
                <div className={`chat-main-panel flex-grow-1 d-flex flex-column ${selectedChat ? 'active' : ''}`} style={{ background: 'var(--nc-gray-50)' }}>
                    {selectedChat ? (
                        <>
                            <div className="chat-topbar d-flex align-items-center gap-2">
                                <button className="icon-btn mobile-back-btn me-2" onClick={() => setSelectedChat(null)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                                </button>
                                <span className={`avatar sm ${selectedChat.color || getAvatarColor(getChatName(selectedChat), selectedChat.isGroupChat)}`}>
                                    {selectedChat.isGroupChat ? "#" : getChatName(selectedChat).charAt(0).toUpperCase()}
                                </span>
                                <div className="flex-grow-1">
                                    <div className="chat-user-name">{getChatName(selectedChat)}</div>
                                    <div className="chat-user-status" style={{ color: isChatOnline(selectedChat) ? 'var(--nc-green)' : 'var(--nc-gray-400)' }}>
                                        ● {selectedChat.isGroupChat 
                                            ? `${selectedChat.users.length} members${getOnlineCount(selectedChat) > 0 ? ` (${getOnlineCount(selectedChat)} online)` : ""}` 
                                            : (isChatOnline(selectedChat) ? "Online" : "Offline")}
                                    </div>
                                </div>
                                <div className="d-flex gap-1">
                                    <button className="icon-btn" title="Voice Call" onClick={() => handleCall('audio')}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg></button>
                                    <button className="icon-btn" title="Video Call" onClick={() => handleCall('video')}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg></button>
                                    <button className="icon-btn" title="Options"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg></button>
                                </div>
                            </div>
                            <div className="chat-messages flex-grow-1 overflow-y-auto p-3">
                                {loading && messages.length === 0 ? (
                                    <div className="text-center mt-5"><div className="spinner-border spinner-border-sm text-primary"></div><div className="text-muted small mt-2">Loading historical messages...</div></div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center mt-5 text-muted small">No messages yet. Send one to start!</div>
                                ) : messages.map((msg, idx) => {
                                    const isMine = msg.sender?._id === userInfo._id;
                                    const senderName = msg.sender?.name || "User";
                                    return (
                                        <div key={idx} className={`msg-row ${isMine ? 'mine' : ''} d-flex align-items-end gap-2 mb-3 ${isMine ? 'justify-content-end' : ''}`}>
                                            {!isMine && (
                                                <span className={`avatar sm ${getAvatarColor(senderName)}`}>{senderName.charAt(0).toUpperCase()}</span>
                                            )}
                                            <div className={isMine ? 'text-end' : ''} style={{maxWidth: '75%'}}>
                                                <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                                    {msg.content ? <div>{msg.content}</div> : null}
                                                    {msg.attachment ? (
                                                        isImageUrl(msg.attachment) ? (
                                                            <a href={toAbsoluteUrl(msg.attachment)} target="_blank" rel="noreferrer">
                                                                <img
                                                                    src={toAbsoluteUrl(msg.attachment)}
                                                                    alt="attachment"
                                                                    style={{ maxWidth: '220px', borderRadius: '10px', marginTop: msg.content ? '8px' : 0 }}
                                                                />
                                                            </a>
                                                        ) : (
                                                            <a
                                                                href={toAbsoluteUrl(msg.attachment)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="small"
                                                                style={{ display: 'inline-block', marginTop: msg.content ? '8px' : 0, color: isMine ? 'rgba(255,255,255,.9)' : 'var(--nc-blue)' }}
                                                            >
                                                                Download attachment →
                                                            </a>
                                                        )
                                                    ) : null}
                                                </div>
                                                <div className={`msg-meta ${isMine ? 'mine' : ''}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            {isMine && (
                                                <span className={`avatar sm ${getAvatarColor(safeUserName)}`}>{safeUserName.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                            {showEmojiPicker && (
                                <div style={{ position: 'absolute', bottom: '70px', right: '80px', zIndex: 1000 }}>
                                    <EmojiPicker onEmojiClick={onEmojiClick} />
                                </div>
                            )}
                            <div className="chat-input-bar d-flex align-items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelected}
                                />
                                <button className="attach-btn" title={uploading ? "Uploading..." : "Attach file"} onClick={handlePickFile} disabled={uploading}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
                                </button>
                                <div className="chat-input-wrap d-flex align-items-center gap-2 flex-grow-1">
                                    <input 
                                        type="text" 
                                        placeholder="Type something here…" 
                                        className="flex-grow-1" 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={sendMessage}
                                    />
                                    <button className="icon-btn opacity-50" onClick={() => setShowEmojiPicker(prev => !prev)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                                    </button>
                                </div>
                                <button className="send-btn" onClick={() => sendMessage({type: 'click'})}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted glass-effect">
                            <div className="welcome-circle mb-3"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--nc-primary)" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg></div>
                            <h4 className="text-dark fw-bold mb-1">NexChat Messages</h4>
                            <p className="small px-4 text-center">Select a contact or search for a new user to start messaging securely.</p>
                        </div>
                    )}
                </div>

                {/* Chat Info Panel */}
                {selectedChat && (
                    <div className="chat-info-panel scroll-nicely">
                        <div className="text-center mb-3 pb-3 border-bottom">
                            <div className="position-relative d-inline-block">
                                <span className={`avatar lg ${selectedChat.color || getAvatarColor(getChatName(selectedChat), selectedChat.isGroupChat)} d-block mx-auto mb-2`}>
                                    {selectedChat.isGroupChat ? "#" : getChatName(selectedChat).charAt(0).toUpperCase()}
                                </span>
                                <span className={`status-indicator ${isChatOnline(selectedChat) ? 'online' : 'offline'} lg`}></span>
                            </div>
                            <div className="fw-bold text-dark" style={{ fontSize: '16px' }}>{getChatName(selectedChat)}</div>
                            <div className="small text-muted mb-3">{selectedChat.isGroupChat ? `${selectedChat.users.length} Participants` : (selectedChat.email || "Verified Contact")}</div>
                            
                            <div className="d-flex justify-content-center gap-3">
                                <button className="act-btn-round" title="Call" onClick={() => handleCall('audio')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg></button>
                                <button className="act-btn-round" title="Video" onClick={() => handleCall('video')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg></button>
                                <button className="act-btn-round" title="Search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></button>
                            </div>
                        </div>

                        <div className="info-section">
                            <div className="info-section-title">Shared Media <span className="ms-auto small link-primary cursor-pointer">See all</span></div>
                            <div className="d-flex gap-2 mb-3">
                                <div className="media-placeholder rounded bg-light flex-grow-1" style={{height: '50px'}}></div>
                                <div className="media-placeholder rounded bg-light flex-grow-1" style={{height: '50px'}}></div>
                                <div className="media-placeholder rounded bg-light flex-grow-1" style={{height: '50px'}}></div>
                            </div>
                        </div>

                        <div className="info-section">
                            <div className="info-section-title">Participants</div>
                            <div className="participants-list">
                                {selectedChat.users.map(u => {
                                    const isUserOnline = u._id !== userInfo?._id && onlineUsers.includes(u._id);
                                    return (
                                        <div key={u._id} className="d-flex align-items-center gap-2 mb-2 p-1 rounded hover-effect">
                                            <div className="position-relative">
                                                <span className={`avatar sm ${getAvatarColor(u.name)}`}>{u.name?.[0] || 'U'}</span>
                                                {u._id !== userInfo?._id && (
                                                    <span className={`status-indicator sm ${isUserOnline ? 'online' : 'offline'}`} style={{ border: '2px solid #fff' }}></span>
                                                )}
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <div className="small fw-medium text-dark text-truncate">{u.name}</div>
                                                <div className="small text-muted" style={{fontSize: '9px'}}>
                                                    {u._id === selectedChat.groupAdmin?._id ? 'Group Admin' : 'Member'}
                                                    {isUserOnline && <span className="ms-1 text-success">• Online</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="info-section mt-auto pt-3">
                            <div className="info-section-title">Quick Actions</div>
                            <div className="d-grid gap-2">
                                <button className="act-btn act-btn-gray text-start w-100 p-2 d-flex align-items-center gap-2">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                                    Mute notifications
                                </button>
                                {selectedChat.isGroupChat && (
                                    <button className="act-btn act-btn-red text-start w-100 p-2 d-flex align-items-center gap-2">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                        Leave Group
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPanel;
