const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const ContactMessage = require("../models/contactMessageModel");

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalChats = await Chat.countDocuments();
        const totalMessages = await Message.countDocuments();
        
        // Mocking trend data for demo feel
        res.json({
            totalUsers,
            totalChats,
            totalMessages,
            activeNow: Math.floor(totalUsers * 0.2) || 0, // Placeholder for online users
            flaggedReports: 5 // Placeholder
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch admin stats" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

const deleteChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (chat) {
            await Chat.deleteOne({ _id: chat._id });
            // Optionally, delete messages associated with this chat
            await Message.deleteMany({ chat: chat._id });
            res.json({ message: "Chat deleted successfully" });
        } else {
            res.status(404).json({ message: "Chat not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting chat" });
    }
};

const getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find({})
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .sort({ updatedAt: -1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chats" });
    }
};

const getAllContactMessages = async (req, res) => {
    try {
        if (req.user?.email !== "admin@nexchat.com") {
            return res.status(403).json({ message: "Only the primary admin can view contact messages" });
        }

        const contactMessages = await ContactMessage.find({}).sort({ createdAt: -1 });
        res.json(contactMessages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch contact messages" });
    }
};

module.exports = { getAdminStats, getAllUsers, deleteUser, getAllChats, deleteChat, getAllContactMessages };
