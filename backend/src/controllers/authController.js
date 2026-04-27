import bcrypt from "bcrypt";
import { User } from "../pg_models/user.js";
import { generateToken } from "../utils/generateToken.js";

// Register new user
// src/controllers/authController.js
export async function register(req, res) {
  try {
    console.log("=== REGISTER CALLED ===");
    console.log("req.body:", req.body);
    console.log("typeof req.body:", typeof req.body);
    console.log("======================");

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        msg: "Name, email, and password are required",
        receivedBody: req.body 
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash: hash, role });

    const token = generateToken(user);
    res.status(201).json({ msg: "Registered successfully", token });
  } catch (err) {
    console.error("Register error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}

// Login user
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ msg: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ 
      msg: "Login successful", 
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}
