const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require('dotenv').config();


async function createAdmin() {

  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas Connected");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const existingAdmin = await User.findOne({ email: "admin@gov.com" });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const admin = new User({
      name: "Government Admin",
      email: "admin@gov.com",
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();

    console.log("Admin account created successfully");

    process.exit();

  } catch (error) {

    console.error("Error:", error);
    process.exit(1);

  }
}

createAdmin();