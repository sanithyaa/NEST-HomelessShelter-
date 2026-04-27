import express from "express";
import { Job } from "../pg_models/job.js";

const router = express.Router();

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.findAll();
    // Transform data to match frontend expectations
    const transformedJobs = jobs.map(j => ({
      ...j.toJSON(),
      id: j.job_id.toString()
    }));
    res.json(transformedJobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Get job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Create new job
router.post("/", async (req, res) => {
  try {
    // Map frontend 'employer' to backend 'organization'
    const jobData = {
      ...req.body,
      organization: req.body.employer || req.body.organization,
    };
    delete jobData.employer;
    
    const job = await Job.create(jobData);
    const response = {
      ...job.toJSON(),
      id: job.job_id.toString(),
    };
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
});

// Update job
router.put("/:id", async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    // Map frontend 'employer' to backend 'organization'
    const jobData = {
      ...req.body,
      organization: req.body.employer || req.body.organization,
    };
    delete jobData.employer;
    
    await job.update(jobData);
    const response = {
      ...job.toJSON(),
      id: job.job_id.toString(),
    };
    res.json(response);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// Delete job
router.delete("/:id", async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    await job.destroy();
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

export default router;
