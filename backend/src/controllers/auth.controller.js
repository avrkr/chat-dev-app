import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";

const signup = async (req, res) => {
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



const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    generateToken(user._id, res);

    return res.status(200).json({
      message: "Login successful",
      user: {
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const logout = (_, res) => {
  res.cookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 0,
  });
  return res.status(200).json({ message: "Logout successful" });
};

const updateProfile = async (req, res) => {
  const { fullname } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (fullname) user.fullname = fullname;

    // Handle profile picture upload if provided  
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile_pictures',
      });
      user.profilePicture = result.secure_url;
    }

    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        fullname: user.fullname,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export { signup, login, logout, updateProfile };