const express = require("express");
const { getAdminStats, getAllUsers, deleteUser, getAllChats, deleteChat } = require("../controllers/adminControllers");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", protect, admin, getAdminStats);
router.get("/users", protect, admin, getAllUsers);
router.get("/chats", protect, admin, getAllChats);
router.delete("/users/:id", protect, admin, deleteUser);
router.delete("/chats/:id", protect, admin, deleteChat);

module.exports = router;
