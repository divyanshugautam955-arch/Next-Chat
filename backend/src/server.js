const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors");
const path = require("path");

const fileUpload = require("express-fileupload");

const uploadRoutes = require("./routes/uploadRoutes");
const adminRoutes = require("./routes/adminRoutes");
const callRoutes = require("./routes/callRoutes");

dotenv.config();
connectDB();
const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (process.env.CLIENT_ORIGIN && origin === process.env.CLIENT_ORIGIN) {
      return callback(null, true);
    }
    // In development, allow everything
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send("API is running..");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/call", callRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: (origin, callback) => callback(null, true), // allow all origins for socket
    credentials: true,
  },
});

const onlineUsers = new Map(); // Use Map to track userId -> socketCount

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.userId = userData._id;
    socket.join(userData._id);
    
    // Increment socket count for this user
    const count = onlineUsers.get(userData._id) || 0;
    onlineUsers.set(userData._id, count + 1);
    
    socket.emit("connected");
    io.emit("online users", Array.from(onlineUsers.keys()));
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // Online / Presence Status
  socket.on("user online", (userId) => {
    socket.broadcast.emit("user status changed", { userId, status: "online" });
  });

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      // We no longer skip the sender here, so that if the user is logged in 
      // on multiple devices, the other devices get the message too.
      // Socket.io will automatically skip the sender's *current* socket.
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  // --- Calling Signaling Engine ---

  // Initiating call
  socket.on("call user", (data) => {
    console.log(`Calling ${data.userToCall} from ${data.from}`);
    socket.in(data.userToCall).emit("call user", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
      callType: data.callType // 'audio' or 'video'
    });
  });

  // Call Response
  socket.on("answer call", (data) => {
    socket.in(data.to).emit("call accepted", data.signal);
  });

  socket.on("decline call", (data) => {
    socket.in(data.to).emit("call declined", { from: data.from });
  });

  socket.on("end call", (data) => {
    socket.in(data.to).emit("call ended");
  });

  socket.on("cancel call", (data) => {
    socket.in(data.to).emit("call cancelled");
  });

  // WebRTC ICE candidates relay
  socket.on("ice candidate", (data) => {
    socket.in(data.to).emit("ice candidate", {
      candidate: data.candidate,
      from: data.from,
    });
  });

  // Peer Toggles (UI feedback)
  socket.on("toggle camera", (data) => {
    socket.in(data.to).emit("peer camera toggled", data.status);
  });

  socket.on("toggle mute", (data) => {
    socket.in(data.to).emit("peer mute toggled", data.status);
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      // Decrement socket count for this user
      const count = onlineUsers.get(socket.userId) || 0;
      if (count <= 1) {
        onlineUsers.delete(socket.userId);
      } else {
        onlineUsers.set(socket.userId, count - 1);
      }
      io.emit("online users", Array.from(onlineUsers.keys()));
    }
    console.log("USER DISCONNECTED");
  });
});

// Restart triggered
