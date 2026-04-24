const express = require("express");
const { fetchCallLogs, createCallLog } = require("../controllers/callControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, fetchCallLogs).post(protect, createCallLog);

module.exports = router;
