const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  getUserStats,
  googleAuth,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/stats").get(protect, getUserStats);
router.post("/", registerUser);
router.post("/login", authUser);
router.post("/google", googleAuth);

module.exports = router;
