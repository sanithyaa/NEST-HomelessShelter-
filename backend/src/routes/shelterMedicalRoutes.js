import express from "express";
import { 
  getResidentMedicalRecords, 
  addMedicalRecord, 
  updateMedicalRecord,
  getSyncStatus 
} from "../controllers/shelterMedicalController.js";
import { protectShelter, requireShelterRole } from "../middlewares/shelterAuth.js";

const router = express.Router();

// All routes require shelter authentication
router.use(protectShelter);

// Get sync status
router.get("/sync/status", getSyncStatus);

// Get medical records for a resident
router.get("/residents/:resident_id", getResidentMedicalRecords);

// Add medical record (medical staff or manager)
router.post("/residents/:resident_id", requireShelterRole('manager', 'medical'), addMedicalRecord);

// Update medical record
router.put("/:record_id", requireShelterRole('manager', 'medical'), updateMedicalRecord);

export default router;
