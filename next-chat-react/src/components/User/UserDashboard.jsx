import React, { useMemo, useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getSocketUrl } from '../../config/runtime';

const SOCKET_ENDPOINT = getSocketUrl();

const UserDashboard = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    const [stats, setStats] = useState({
        totalChats: 0,
        unreadMessages: 0,
        totalGroups: 0,
        onlineFriends: 0,
        filesShared: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [chatsLoading, setChatsLoading] = useState(true);
    const [chats, setChats] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const socketRef = useRef(null);

    useEffect(() => {
        if (!userInfo?._id) return;
        
        console.log("Dashboard initializing socket...");
        const socket = io(SOCKET_ENDPOINT, {
            transports: ["websocket", "polling"],
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Dashboard socket connected:", socket.id);
            socket.emit("setup", userInfo);
        });

        socket.on("online users", (users) => {
            console.log("Dashboard online users received:", users);
            setOnlineUsers(users);
        });

        return () => {
            console.log("Dashboard cleaning up socket");
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const { data } = await api.get('/user/stats');
            setStats(data);
        } catch {
            toast.error("Failed to load dashboard stats");
            setStats({
                totalChats: 0,
                unreadMessages: 0,
                totalGroups: 0,
                onlineFriends: 0,
                filesShared: 0,
            });
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchChats = async () => {
        try {
            setChatsLoading(true);
            const { data } = await api.get('/chat');
            setChats(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Failed to load recent chats");
            setChats([]);
        } finally {
            setChatsLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const getChatTitle = (chat) => {
        if (!chat) return "Chat";
        if (chat.isGroupChat) return chat.chatName || "Group";
        const other = (chat.users || []).find(u => u?._id !== userInfo?._id);
        return other?.name || "User";
    };

    const getChatSubtitle = (chat) => {
        const lm = chat?.latestMessage;
        if (!lm) return "Start a conversation";
        const senderName = lm.sender?.name || "User";
        const content = lm.content || "";
        return `${senderName}: ${content}`;
    };

    const recentChats = useMemo(() => {
        return (chats || [])
            .slice()
            .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
            .slice(0, 6);
    }, [chats]);

    const people = useMemo(() => {
        const map = new Map();
        (chats || [])
            .filter(c => !c?.isGroupChat)
            .forEach((c) => {
                const other = (c.users || []).find(u => u?._id !== userInfo?._id);
                if (!other?._id) return;
                const lastActive = c.latestMessage?.createdAt || c.updatedAt || c.createdAt;
                const prev = map.get(other._id);
                if (!prev || new Date(lastActive || 0) > new Date(prev.lastActive || 0)) {
                    map.set(other._id, { ...other, lastActive, chat: c });
                }
            });

        return Array.from(map.values())
            .filter(p => onlineUsers.includes(p._id))
            .sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));
    }, [chats, userInfo?._id, onlineUsers]);

    const getAvatarColor = (name) => {
        const colors = ['green', 'amber', 'purple', 'pink', 'blue', 'orange'];
        const charCode = (name?.[0]?.toUpperCase()?.charCodeAt(0) || 0) % colors.length;
        return colors[charCode];
    };

    return (
        <div className="panel active">
            <div className="dash-body">
                <div className="page-intro d-flex flex-wrap justify-content-between align-items-end gap-2">
                    <div>
                        <h2>Welcome back, {userInfo.name || 'User'}!</h2>
                        <p>Here’s what’s happening in your chats</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="act-btn act-btn-gray btn-sm" onClick={() => { fetchStats(); fetchChats(); }}>
                            Refresh
                        </button>
                        <button className="act-btn act-btn-blue btn-sm" onClick={() => navigate('/user')}>
                            Open Messages →
                        </button>
                    </div>
                </div>
                <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-card-label">Unread Msgs</div><div className="stat-card-val">{statsLoading ? "..." : stats.unreadMessages}</div></div></div>
                    <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-card-label">Total Chats</div><div className="stat-card-val">{statsLoading ? "..." : stats.totalChats}</div></div></div>
                    <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-card-label">Active Groups</div><div className="stat-card-val">{statsLoading ? "..." : stats.totalGroups}</div></div></div>
                    <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-card-label">Files Shared</div><div className="stat-card-val">{statsLoading ? "..." : stats.filesShared}</div></div></div>
                </div>
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="nc-card h-100">
                            <div className="card-head d-flex justify-content-between align-items-center">
                                <span className="card-title">Recent Chats</span>
                                <span className="card-action cursor-pointer" onClick={() => navigate('/user')}>Open →</span>
                            </div>
                            <div className="nc-card-body">
                                {chatsLoading ? (
                                    <div className="text-muted small py-4 text-center">
                                        <div className="spinner-border spinner-border-sm me-2"></div>
                                        Loading recent chats...
                                    </div>
                                ) : recentChats.length === 0 ? (
                                    <div className="text-muted small py-4 text-center">No chats yet. Start a new conversation from Messages.</div>
                                ) : recentChats.map((chat) => {
                                    const title = getChatTitle(chat);
                                    const subtitle = getChatSubtitle(chat);
                                    const avatarText = chat.isGroupChat ? "#" : (title?.[0]?.toUpperCase() || "U");
                                    const avatarColor = getAvatarColor(title);
                                    const isAnyOnline = chat.isGroupChat && (chat.users || []).some(u => u._id !== userInfo?._id && onlineUsers.includes(u._id));
                                    return (
                                        <div
                                            key={chat._id}
                                            className="online-item d-flex align-items-center gap-2 cursor-pointer"
                                            onClick={() => navigate('/user', { state: { selectedChat: chat } })}
                                            title={subtitle}
                                        >
                                            <span className={`avatar sm ${avatarColor}`}>{avatarText}</span>
                                            <span className={`online-dot ${chat.isGroupChat ? (isAnyOnline ? 'online' : 'away') : ''}`}></span>
                                            <span className="online-name flex-grow-1 text-truncate" style={{ maxWidth: '190px' }}>
                                                {title}
                                            </span>
                                            <span className="online-time text-truncate" style={{ maxWidth: '160px' }}>
                                                {subtitle}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="nc-card h-100">
                            <div className="card-head"><span className="card-title">Online Users</span></div>
                            <div className="nc-card-body">
                                <div className="text-muted small mb-2">People currently online</div>
                                {chatsLoading ? (
                                    <div className="text-muted small py-4 text-center">
                                        <div className="spinner-border spinner-border-sm me-2"></div>
                                        Loading people...
                                    </div>
                                ) : people.length === 0 ? (
                                    <div className="text-muted small py-4 text-center">No recent contacts yet.</div>
                                ) : people.map((p) => {
                                    const name = p?.name || "User";
                                    const avatarColor = getAvatarColor(name);
                                    const lastSeen = p.lastActive ? new Date(p.lastActive).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : "—";
                                    return (
                                        <div
                                            key={p._id}
                                            className="online-item d-flex align-items-center gap-2 cursor-pointer"
                                            onClick={() => navigate('/user', { state: { selectedChat: p.chat } })}
                                            title={`Last activity: ${lastSeen}`}
                                        >
                                            <span className={`avatar sm ${avatarColor}`}>{name.charAt(0).toUpperCase()}</span>
                                            <span className="online-dot"></span>
                                            <span className="online-name flex-grow-1">{name}</span>
                                            <span className="online-time small text-muted">{lastSeen}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
