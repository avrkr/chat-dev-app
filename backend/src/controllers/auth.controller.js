import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    // Validation
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate token (e.g. JWT)
    generateToken(newUser._id, res);

    // Send welcome email (non-blocking, but awaited here for safety)
    await sendWelcomeEmail(email, fullname);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        fullname: newUser.fullname,
        email: newUser.email,
      },
    });

  } catch (error) {
    console.error("Error during user signup:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
