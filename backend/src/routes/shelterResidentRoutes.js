import express from "express";
import { 
  getResidents, 
  getResidentDetails, 
  addResident, 
  updateResident, 
  dischargeResident 
} from "../controllers/shelterController.js";
import { protectShelter, requireShelterRole } from "../middlewares/shelterAuth.js";

const router = express.Router();

// All routes require shelter authentication
router.use(protectShelter);

// Get all residents
router.get("/", getResidents);

// Add new resident (walk-in)
router.post("/", requireShelterRole('manager', 'staff'), addResident);

// Get resident details
router.get("/:id", getResidentDetails);

// Update resident
router.put("/:id", requireShelterRole('manager', 'staff'), updateResident);

// Discharge resident
router.delete("/:id", requireShelterRole('manager'), dischargeResident);

export default router;
