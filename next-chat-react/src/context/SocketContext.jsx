import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { getSocketUrl } from '../config/runtime';
import { pushNotification } from '../utils/notifications';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const SOCKET_ENDPOINT = getSocketUrl();

    useEffect(() => {
        if (!userInfo?._id) return;

        console.log("Global Socket initializing to:", SOCKET_ENDPOINT);
        const newSocket = io(SOCKET_ENDPOINT, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
        });

        newSocket.on("connect", () => {
            console.log("Global Socket connected:", newSocket.id);
            newSocket.emit("setup", userInfo);
        });

        newSocket.on("online users", (users) => {
            setOnlineUsers(users);
        });

        const messageHandler = (newMessageRecieved) => {
            // Check if we are currently looking at this chat
            // This is tricky without knowing the selectedChat state globally,
            // but we can emit a local event or check a shared ref.
            // For now, let's just emit the notification if it's from someone else.
            
            const senderName = newMessageRecieved.sender?.name || "User";
            
            // We'll dispatch a custom event so the ChatPanel can handle it if it's open
            window.dispatchEvent(new CustomEvent("nc:message_received", { detail: newMessageRecieved }));
            
            // If the message is not from ourselves, show a notification
            if (newMessageRecieved.sender?._id !== userInfo._id) {
                toast.success(`New message from ${senderName}`);
                pushNotification({
                    id: `${newMessageRecieved._id || Date.now()}`,
                    type: "message",
                    text: `${senderName}: ${newMessageRecieved.content || 'Sent an attachment'}`,
                    createdAt: newMessageRecieved.createdAt || new Date().toISOString(),
                    read: false,
                    initials: senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                    color: "purple",
                    chatId: newMessageRecieved.chat?._id,
                });
            }
        };

        newSocket.on("message recieved", messageHandler);

        setSocket(newSocket);

        return () => {
            console.log("Global Socket disconnecting");
            newSocket.off("message recieved", messageHandler);
            newSocket.disconnect();
        };
    }, [userInfo?._id]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
