import express from "express";
import { 
  getPendingRequests, 
  getRequestDetails, 
  acceptRequest, 
  rejectRequest 
} from "../controllers/shelterController.js";
import { protectShelter, requireShelterRole } from "../middlewares/shelterAuth.js";

const router = express.Router();

// All routes require shelter authentication
router.use(protectShelter);

// Get all pending requests for this shelter
router.get("/", getPendingRequests);

// Get single request details
router.get("/:id", getRequestDetails);

// Accept request (manager only)
router.post("/:id/accept", requireShelterRole('manager'), acceptRequest);

// Reject request (manager only)
router.post("/:id/reject", requireShelterRole('manager'), rejectRequest);

export default router;
