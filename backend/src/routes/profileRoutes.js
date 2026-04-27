import express from "express";
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile
} from "../controllers/profileController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create (protected)
router.post("/", protect, createProfile);

// Read all
router.get("/", getAllProfiles);

// Read one
router.get("/:id", getProfileById);

// Update (protected)
router.patch("/:id", protect, updateProfile);

// Delete (protected)
router.delete("/:id", protect, deleteProfile);

export default router;
