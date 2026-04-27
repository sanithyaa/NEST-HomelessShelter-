import express from "express";
import { Shelter } from "../pg_models/shelter.js";

const router = express.Router();

// Get all shelters
router.get("/", async (req, res) => {
  try {
    const shelters = await Shelter.findAll();
    // Transform data to match frontend expectations
    const transformedShelters = shelters.map(s => ({
      ...s.toJSON(),
      id: s.shelter_id.toString(),
      occupied: s.capacity - (s.available_beds || 0)
    }));
    res.json(transformedShelters);
  } catch (error) {
    console.error("Error fetching shelters:", error);
    res.status(500).json({ error: "Failed to fetch shelters" });
  }
});

// Get shelter by ID
router.get("/:id", async (req, res) => {
  try {
    const shelter = await Shelter.findByPk(req.params.id);
    if (!shelter) {
      return res.status(404).json({ error: "Shelter not found" });
    }
    res.json(shelter);
  } catch (error) {
    console.error("Error fetching shelter:", error);
    res.status(500).json({ error: "Failed to fetch shelter" });
  }
});

// Create new shelter
router.post("/", async (req, res) => {
  try {
    // Convert frontend 'occupied' to backend 'available_beds'
    const shelterData = {
      ...req.body,
      available_beds: req.body.capacity - (req.body.occupied || 0),
    };
    delete shelterData.occupied;
    
    const shelter = await Shelter.create(shelterData);
    const response = {
      ...shelter.toJSON(),
      id: shelter.shelter_id.toString(),
      occupied: shelter.capacity - (shelter.available_beds || 0),
    };
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating shelter:", error);
    res.status(500).json({ error: "Failed to create shelter" });
  }
});

// Update shelter
router.put("/:id", async (req, res) => {
  try {
    const shelter = await Shelter.findByPk(req.params.id);
    if (!shelter) {
      return res.status(404).json({ error: "Shelter not found" });
    }
    
    // Convert frontend 'occupied' to backend 'available_beds'
    const shelterData = {
      ...req.body,
      available_beds: req.body.capacity - (req.body.occupied || 0),
    };
    delete shelterData.occupied;
    
    await shelter.update(shelterData);
    const response = {
      ...shelter.toJSON(),
      id: shelter.shelter_id.toString(),
      occupied: shelter.capacity - (shelter.available_beds || 0),
    };
    res.json(response);
  } catch (error) {
    console.error("Error updating shelter:", error);
    res.status(500).json({ error: "Failed to update shelter" });
  }
});

// Delete shelter
router.delete("/:id", async (req, res) => {
  try {
    const shelter = await Shelter.findByPk(req.params.id);
    if (!shelter) {
      return res.status(404).json({ error: "Shelter not found" });
    }
    await shelter.destroy();
    res.json({ message: "Shelter deleted successfully" });
  } catch (error) {
    console.error("Error deleting shelter:", error);
    res.status(500).json({ error: "Failed to delete shelter" });
  }
});

export default router;
