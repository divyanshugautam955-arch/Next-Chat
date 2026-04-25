require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/userModel");

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@nexchat.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.ADMIN_NAME || "Real Time Chat Application Admin";

  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in environment");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.isAdmin = true;
    // Always reset to the known admin credentials for recovery.
    existing.password = password;
    existing.name = name;
    await existing.save();
    console.log(`Admin ready: ${email} (updated existing user)`);
  } else {
    await User.create({ name, email, password, isAdmin: true });
    console.log(`Admin ready: ${email} (created)`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
