/**
 * AI Routes - GPU-accelerated AI features
 */

import express from 'express';
import {
  getShelterRecommendations,
  getJobRecommendations,
  analyzeVolunteerNotes,
  getRiskAssessment,
  optimizeVolunteerRoutes,
  provideFeedback,
  getAIStatistics,
  aiHealthCheck,
} from '../controllers/aiController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Health check (public)
router.get('/health', aiHealthCheck);

// Statistics (optional auth - works better with auth but doesn't require it)
router.get('/statistics', optionalAuth, getAIStatistics);

// Shelter recommendations (optional auth)
router.get('/recommendations/shelters/:profile_id', optionalAuth, getShelterRecommendations);

// Job recommendations (optional auth)
router.get('/recommendations/jobs/:profile_id', optionalAuth, getJobRecommendations);

// NLP analysis of volunteer notes (requires auth)
router.post('/analyze/notes/:profile_id', protect, analyzeVolunteerNotes);

// Risk assessment (optional auth)
router.get('/risk/assess/:profile_id', optionalAuth, getRiskAssessment);

// Route optimization (requires auth)
router.post('/routes/optimize', protect, optimizeVolunteerRoutes);

// Feedback (optional auth)
router.post('/feedback', optionalAuth, provideFeedback);

export default router;
