const generateToken = require("../config/generateToken");
const User = require("../models/userModel");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
};

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
};

//@description     Auth the user
//@route           POST /api/user/login
//@access          Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
};

const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalChats = await Chat.countDocuments({ users: userId });
    const totalGroups = await Chat.countDocuments({ users: userId, isGroupChat: true });

    const chatIds = await Chat.find({ users: userId }).distinct("_id");

    const unreadMessages = await Message.countDocuments({
      chat: { $in: chatIds },
      sender: { $ne: userId },
      readBy: { $ne: userId },
    });

    const filesShared = await Message.countDocuments({
      sender: userId,
      attachment: { $exists: true, $ne: null, $ne: "" },
    });

    res.json({
      totalChats,
      unreadMessages,
      totalGroups,
      // No presence/online tracking implemented yet; avoid fake numbers.
      onlineFriends: 0,
      filesShared,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user stats" });
  }
};

module.exports = { allUsers, registerUser, authUser, getUserStats };
