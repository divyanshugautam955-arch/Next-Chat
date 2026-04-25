const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ 
      chat: req.params.chatId,
      deletedFor: { $ne: req.user._id }
    })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = async (req, res) => {
  const { content, chatId, attachment } = req.body;

  if ((!content && !attachment) || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    attachment: attachment,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      res.status(404);
      throw new Error("Message Not Found");
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("You can only delete your own messages for everyone");
    }

    message.content = "This message was deleted";
    message.attachment = null;
    message.isDeletedForEveryone = true;
    await message.save();

    const fullMessage = await Message.findById(message._id)
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(fullMessage);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const deleteMessageForMe = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { $addToSet: { deletedFor: req.user._id } },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = { allMessages, sendMessage, deleteMessage, deleteMessageForMe };
