const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/", protect, (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  let uploadedFile = req.files.file;
  const fileName = Date.now() + "_" + uploadedFile.name;
  const uploadsDir = path.join(__dirname, "../../uploads");
  const uploadPath = path.join(uploadsDir, fileName);

  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    return res.status(500).json({ message: "Failed to prepare upload directory" });
  }

  uploadedFile.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "File uploaded!", url: `/uploads/${fileName}` });
  });
});

module.exports = router;
