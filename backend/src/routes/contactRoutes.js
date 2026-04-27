const express = require("express");
const { submitContactMessage } = require("../controllers/contactControllers");

const router = express.Router();

router.post("/", submitContactMessage);

module.exports = router;
