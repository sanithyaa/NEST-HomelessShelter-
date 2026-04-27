import bcrypt from "bcrypt";
import { ShelterUser } from "../pg_models/shelterUser.js";
import { Shelter } from "../pg_models/shelter.js";
import jwt from "jsonwebtoken";

// Generate JWT token for shelter user
function generateShelterToken(shelterUser) {
  return jwt.sign(
    {
      shelter_user_id: shelterUser.shelter_user_id,
      shelter_id: shelterUser.shelter_id,
      role: shelterUser.role,
      type: 'shelter' // Distinguish from NGO users
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Shelter staff login
export async function shelterLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    // Find shelter user
    const shelterUser = await ShelterUser.findOne({ 
      where: { email },
      include: [{
        model: Shelter,
        attributes: ['shelter_id', 'name', 'address']
      }]
    });

    if (!shelterUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!shelterUser.is_active) {
      return res.status(403).json({ msg: "Account is deactivated" });
    }

    // Verify password
    const match = await bcrypt.compare(password, shelterUser.password_hash);
    if (!match) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Generate token
    const token = generateShelterToken(shelterUser);

    res.json({
      msg: "Login successful",
      token,
      user: {
        shelter_user_id: shelterUser.shelter_user_id,
        name: shelterUser.name,
        email: shelterUser.email,
        role: shelterUser.role,
        shelter_id: shelterUser.shelter_id,
        shelter_name: shelterUser.Shelter?.name
      }
    });

  } catch (err) {
    console.error("Shelter login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

// Register new shelter user (admin only)
export async function registerShelterUser(req, res) {
  try {
    const { shelter_id, name, email, password, role } = req.body;

    if (!shelter_id || !name || !email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    // Check if email already exists
    const existing = await ShelterUser.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Verify shelter exists
    const shelter = await Shelter.findByPk(shelter_id);
    if (!shelter) {
      return res.status(404).json({ msg: "Shelter not found" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create shelter user
    const shelterUser = await ShelterUser.create({
      shelter_id,
      name,
      email,
      password_hash,
      role: role || 'staff'
    });

    res.status(201).json({
      msg: "Shelter user created successfully",
      user: {
        shelter_user_id: shelterUser.shelter_user_id,
        name: shelterUser.name,
        email: shelterUser.email,
        role: shelterUser.role,
        shelter_id: shelterUser.shelter_id
      }
    });

  } catch (err) {
    console.error("Register shelter user error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

// Get current shelter user info
export async function getShelterUserInfo(req, res) {
  try {
    const shelterUser = await ShelterUser.findByPk(req.shelterUser.shelter_user_id, {
      include: [{
        model: Shelter,
        attributes: ['shelter_id', 'name', 'address', 'capacity', 'available_beds']
      }],
      attributes: { exclude: ['password_hash'] }
    });

    if (!shelterUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(shelterUser);
  } catch (err) {
    console.error("Get shelter user info error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}
