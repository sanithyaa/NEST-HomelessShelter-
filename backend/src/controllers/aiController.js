/**
 * AI Controller - Handles AI-powered features
 * Integrates database data with GPU-accelerated AI models
 */

import { HomelessProfile } from '../pg_models/homelessProfile.js';
import { Shelter } from '../pg_models/shelter.js';
import { Job } from '../pg_models/job.js';
import { User } from '../pg_models/user.js';
import { sequelize } from '../config/postgres.js';
import { AIRecommendation } from '../mongo_models/ai_recommendation.js';
import aiService from '../services/aiService.js';
import { Op } from 'sequelize';

/**
 * Get shelter recommendations for a homeless individual
 */
export const getShelterRecommendations = async (req, res) => {
  try {
    const { profile_id } = req.params;
    const { top_k = 5 } = req.query;

    // Fetch individual profile from PostgreSQL
    const individual = await HomelessProfile.findByPk(profile_id);
    if (!individual) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch available shelters from PostgreSQL
    const shelters = await Shelter.findAll({
      where: {
        available_beds: { [Op.gt]: 0 }
      }
    });

    if (shelters.length === 0) {
      return res.status(200).json({
        message: 'No shelters available',
        recommendations: []
      });
    }

    // Call AI service for recommendations
    const recommendations = await aiService.recommendShelters(
      individual.toJSON(),
      shelters.map(s => s.toJSON()),
      parseInt(top_k)
    );

    // Store recommendations in MongoDB
    await AIRecommendation.create({
      profile_id: profile_id,
      recommendation_type: 'shelter',
      recommendations: recommendations.recommendations,
      created_at: new Date(),
    });

    res.json({
      profile_id: profile_id,
      profile_name: individual.name,
      recommendations: recommendations.recommendations,
      total_shelters_analyzed: shelters.length,
    });

  } catch (error) {
    console.error('❌ Error in getShelterRecommendations:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Check if Python AI service is running on port 5001'
    });
  }
};

/**
 * Get job recommendations for a homeless individual
 */
export const getJobRecommendations = async (req, res) => {
  try {
    const { profile_id } = req.params;
    const { top_k = 5 } = req.query;

    // Fetch individual profile
    const individual = await HomelessProfile.findByPk(profile_id);
    if (!individual) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch available jobs
    const jobs = await Job.findAll();

    if (jobs.length === 0) {
      return res.status(200).json({
        message: 'No jobs available',
        recommendations: []
      });
    }

    // Call AI service
    console.log(`🔍 Getting job recommendations for profile ${profile_id}`);
    console.log(`   Skills: ${individual.skills}`);
    console.log(`   Available jobs: ${jobs.length}`);
    
    const recommendations = await aiService.recommendJobs(
      individual.toJSON(),
      jobs.map(j => j.toJSON()),
      parseInt(top_k)
    );
    
    console.log(`✅ Got ${recommendations.recommendations?.length || 0} job recommendations`);

    // Store in MongoDB
    await AIRecommendation.create({
      profile_id: profile_id,
      recommendation_type: 'job',
      recommendations: recommendations.recommendations,
      created_at: new Date(),
    });

    res.json({
      profile_id: profile_id,
      profile_name: individual.name,
      recommendations: recommendations.recommendations,
      total_jobs_analyzed: jobs.length,
    });

  } catch (error) {
    console.error('❌ Error in getJobRecommendations:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Check if Python AI service is running on port 5001'
    });
  }
};

/**
 * Analyze volunteer notes using NLP
 */
export const analyzeVolunteerNotes = async (req, res) => {
  try {
    const { profile_id } = req.params;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    // Call AI service for NLP analysis
    const analysis = await aiService.analyzeNotes(notes);

    // Update profile with extracted information
    const individual = await HomelessProfile.findByPk(profile_id);
    if (individual) {
      // Update skills if found
      if (analysis.skills && analysis.skills.length > 0) {
        const existingSkills = individual.skills ? individual.skills.split(',') : [];
        const newSkills = [...new Set([...existingSkills, ...analysis.skills])];
        individual.skills = newSkills.join(',');
      }

      // Update health status if concerns found
      if (analysis.health_concerns && Object.keys(analysis.health_concerns).length > 0) {
        const healthIssues = Object.values(analysis.health_concerns).flat();
        if (healthIssues.length > 0) {
          individual.health_status = healthIssues.join(', ');
        }
      }

      await individual.save();
    }

    res.json({
      profile_id: profile_id,
      analysis: analysis,
      profile_updated: !!individual,
    });

  } catch (error) {
    console.error('Error in analyzeVolunteerNotes:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get comprehensive risk assessment
 */
export const getRiskAssessment = async (req, res) => {
  try {
    const { profile_id } = req.params;

    // Fetch individual profile
    const individual = await HomelessProfile.findByPk(profile_id);
    if (!individual) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Call AI service for risk assessment
    const riskAssessment = await aiService.assessRisk(individual.toJSON());

    // Store in MongoDB
    await AIRecommendation.create({
      profile_id: profile_id,
      recommendation_type: 'risk_assessment',
      risk_data: riskAssessment,
      urgency_score: riskAssessment.immediate_intervention?.probability || 0,
      created_at: new Date(),
    });

    res.json({
      profile_id: profile_id,
      profile_name: individual.name,
      risk_assessment: riskAssessment,
    });

  } catch (error) {
    console.error('Error in getRiskAssessment:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Optimize volunteer routes
 */
export const optimizeVolunteerRoutes = async (req, res) => {
  try {
    const { volunteer_ids, profile_ids } = req.body;

    if (!volunteer_ids || !profile_ids) {
      return res.status(400).json({ 
        error: 'volunteer_ids and profile_ids are required' 
      });
    }

    // Fetch volunteers (from User table with role='volunteer')
    const volunteers = await User.findAll({
      where: {
        user_id: volunteer_ids,
        role: 'volunteer'
      }
    });

    // Fetch homeless individuals
    const individuals = await HomelessProfile.findAll({
      where: {
        profile_id: profile_ids
      }
    });

    if (volunteers.length === 0 || individuals.length === 0) {
      return res.status(400).json({ 
        error: 'No volunteers or individuals found' 
      });
    }

    // Call AI service for route optimization
    const optimizedRoutes = await aiService.optimizeRoutes(
      volunteers.map(v => v.toJSON()),
      individuals.map(i => i.toJSON())
    );

    res.json({
      optimized_routes: optimizedRoutes,
      volunteers_count: volunteers.length,
      individuals_count: individuals.length,
    });

  } catch (error) {
    console.error('Error in optimizeVolunteerRoutes:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Provide feedback on AI recommendations
 */
export const provideFeedback = async (req, res) => {
  try {
    const { resource_type, resource_id, success, outcome_score } = req.body;

    if (!resource_type || !resource_id || success === undefined) {
      return res.status(400).json({ 
        error: 'resource_type, resource_id, and success are required' 
      });
    }

    // Send feedback to AI service
    await aiService.provideFeedback(
      resource_type,
      resource_id,
      success,
      outcome_score
    );

    res.json({
      message: 'Feedback recorded successfully',
      resource_type,
      resource_id,
    });

  } catch (error) {
    console.error('Error in provideFeedback:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get AI service statistics
 */
export const getAIStatistics = async (req, res) => {
  try {
    const stats = await aiService.getStatistics();
    
    // Add database statistics
    const totalProfiles = await HomelessProfile.count();
    const totalShelters = await Shelter.count();
    const totalJobs = await Job.count();
    const totalRecommendations = await AIRecommendation.countDocuments();

    res.json({
      ai_service: stats,
      database: {
        total_profiles: totalProfiles,
        total_shelters: totalShelters,
        total_jobs: totalJobs,
        total_recommendations: totalRecommendations,
      },
    });

  } catch (error) {
    console.error('Error in getAIStatistics:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Health check for AI service
 */
export const aiHealthCheck = async (req, res) => {
  try {
    const health = await aiService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
};
