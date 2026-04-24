const mongoose = require("mongoose");

const callLogSchema = mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    callType: { type: String, enum: ["audio", "video"] },
    status: { type: String, enum: ["missed", "completed", "declined"] },
    duration: { type: Number, default: 0 }, // in seconds
  },
  { timestamps: true }
);

const CallLog = mongoose.model("CallLog", callLogSchema);
module.exports = CallLog;
