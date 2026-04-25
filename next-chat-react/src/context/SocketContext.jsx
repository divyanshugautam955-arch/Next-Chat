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
            const senderName = newMessageRecieved.sender?.name || "User";
            
            // Dispatch event for ChatPanel to update message list
            window.dispatchEvent(new CustomEvent("nc:message_received", { detail: newMessageRecieved }));
            
            // Notification logic
            if (newMessageRecieved.sender?._id !== userInfo._id) {
                // Check if chat is muted
                let isMuted = false;
                try {
                    const mutedChats = JSON.parse(localStorage.getItem('mutedChats')) || [];
                    isMuted = mutedChats.includes(newMessageRecieved.chat?._id);
                } catch (e) {
                    console.error("Error reading mutedChats", e);
                }

                if (!isMuted) {
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
            }
        };

        const deleteHandler = (deletedMessage) => {
            window.dispatchEvent(new CustomEvent("nc:message_deleted", { detail: deletedMessage }));
        };

        newSocket.on("message recieved", messageHandler);
        newSocket.on("message deleted", deleteHandler);

        setSocket(newSocket);

        return () => {
            console.log("Global Socket disconnecting");
            newSocket.off("message recieved", messageHandler);
            newSocket.off("message deleted", deleteHandler);
            newSocket.disconnect();
        };
    }, [userInfo?._id]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
