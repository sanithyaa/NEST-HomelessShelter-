import { HomelessProfile } from "../pg_models/homelessProfile.js";

// 🟢 Create new profile
export async function createProfile(req, res) {
  try {
    const data = {
      ...req.body,
      registered_by: req.user.user_id, // Get from JWT token
    };
    
    console.log("Creating profile with data:", data);
    const profile = await HomelessProfile.create(data);
    console.log("Profile created:", profile.profile_id);
    
    res.status(201).json(profile);
  } catch (err) {
    console.error("Create profile error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}

// 🔵 Get all profiles
export async function getAllProfiles(req, res) {
  try {
    const profiles = await HomelessProfile.findAll();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}

// 🟣 Get single profile by ID
export async function getProfileById(req, res) {
  try {
    const { id } = req.params;
    const profile = await HomelessProfile.findByPk(id);
    if (!profile) return res.status(404).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}

// 🟠 Update a profile
export async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const profile = await HomelessProfile.findByPk(id);
    if (!profile) return res.status(404).json({ msg: "Profile not found" });

    await profile.update(updates);
    res.json({ msg: "Profile updated", profile });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}

// 🔴 Delete a profile
export async function deleteProfile(req, res) {
  try {
    const { id } = req.params;
    const profile = await HomelessProfile.findByPk(id);
    if (!profile) return res.status(404).json({ msg: "Profile not found" });

    await profile.destroy();
    res.json({ msg: "Profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}
