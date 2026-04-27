const ContactMessage = require("../models/contactMessageModel");

const submitContactMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !email || !subject || !message) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    await ContactMessage.create({
      firstName,
      lastName: lastName || "",
      email,
      subject,
      message,
    });

    return res.status(201).json({ message: "Your message has been sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message. Please try again." });
  }
};

module.exports = { submitContactMessage };
