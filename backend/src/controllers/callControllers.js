const CallLog = require("../models/callLogModel");

const fetchCallLogs = async (req, res) => {
    try {
        const logs = await CallLog.find({
            $or: [{ caller: req.user._id }, { receiver: req.user._id }],
        })
        .populate("caller", "name pic email")
        .populate("receiver", "name pic email")
        .sort({ createdAt: -1 });
        
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch call logs" });
    }
};

const createCallLog = async (req, res) => {
    const { receiver, callType, status, duration } = req.body;
    try {
        const log = await CallLog.create({
            caller: req.user._id,
            receiver,
            callType,
            status,
            duration
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: "Failed to create call log" });
    }
};

module.exports = { fetchCallLogs, createCallLog };
