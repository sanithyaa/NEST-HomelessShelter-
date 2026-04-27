import express from "express";
import { shelterLogin, registerShelterUser, getShelterUserInfo } from "../controllers/shelterAuthController.js";
import { protectShelter } from "../middlewares/shelterAuth.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Shelter staff login
router.post("/login", shelterLogin);

// Register new shelter user (NGO admin only)
router.post("/register", protect, authorizeRoles("admin"), registerShelterUser);

// Get current shelter user info
router.get("/me", protectShelter, getShelterUserInfo);

export default router;
