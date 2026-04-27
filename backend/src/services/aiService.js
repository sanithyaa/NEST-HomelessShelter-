/**
 * AI Service - Bridge between Node.js backend and Python AI models
 * Communicates with the GPU-accelerated Python AI service
 */

import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

class AIService {
  /**
   * Get shelter recommendations for a homeless individual
   */
  async recommendShelters(individual, shelters, topK = 5) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/recommend/shelters`, {
        individual: {
          id: individual.profile_id?.toString(),
          skills: individual.skills ? individual.skills.split(',').map(s => s.trim()) : [],
          location: individual.geo_lat && individual.geo_lng 
            ? [individual.geo_lat, individual.geo_lng] 
            : null,
          priority: (individual.priority || 'medium').toLowerCase(),
          age: individual.age,
          gender: individual.gender,
          education: individual.education,
          health_status: individual.health_status,
        },
        shelters: shelters.map(shelter => ({
          id: shelter.shelter_id?.toString(),
          name: shelter.name,
          location: shelter.geo_lat && shelter.geo_lng 
            ? [shelter.geo_lat, shelter.geo_lng] 
            : null,
          capacity: shelter.capacity,
          occupied: shelter.capacity - (shelter.available_beds || 0),
          amenities: shelter.amenities ? shelter.amenities.split(',') : [],
          priority_support: ['low', 'medium', 'high', 'critical'],
          required_skills: [],
        })),
        top_k: topK,
        use_bandit: true,
      });

      return response.data;
    } catch (error) {
      console.error('Error calling AI service for shelter recommendations:', error.message);
      throw new Error('AI service unavailable');
    }
  }

  /**
   * Get job recommendations for a homeless individual
   */
  async recommendJobs(individual, jobs, topK = 5) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/recommend/jobs`, {
        individual: {
          id: individual.profile_id?.toString(),
          skills: individual.skills ? individual.skills.split(',').map(s => s.trim()) : [],
          location: individual.geo_lat && individual.geo_lng 
            ? [individual.geo_lat, individual.geo_lng] 
            : null,
          priority: (individual.priority || 'medium').toLowerCase(),
          age: individual.age,
          gender: individual.gender,
          education: individual.education,
          work_experience_years: individual.work_experience_years || 0,
        },
        jobs: jobs.map(job => ({
          id: job.job_id?.toString(),
          name: job.title,
          location: job.geo_lat && job.geo_lng 
            ? [job.geo_lat, job.geo_lng] 
            : null,
          required_skills: job.skills_required ? job.skills_required.split(',').map(s => s.trim()) : [],
          organization: job.organization,
          capacity: 1,
          occupied: 0,
          priority_support: ['low', 'medium', 'high'],
        })),
        top_k: topK,
        use_bandit: true,
      });

      return response.data;
    } catch (error) {
      console.error('Error calling AI service for job recommendations:', error.message);
      throw new Error('AI service unavailable');
    }
  }

  /**
   * Analyze volunteer notes using NLP
   */
  async analyzeNotes(notes) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/nlp/analyze`, {
        notes: notes,
      });

      return response.data;
    } catch (error) {
      console.error('Error calling AI service for NLP analysis:', error.message);
      throw new Error('AI service unavailable');
    }
  }

  /**
   * Get risk assessment for an individual
   */
  async assessRisk(individual, nlpAnalysis = null) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/risk/assess`, {
        profile: {
          age: individual.age,
          skills: individual.skills ? individual.skills.split(',').map(s => s.trim()) : [],
          education: individual.education,
          health_conditions: individual.health_status ? [individual.health_status] : [],
          duration_homeless: individual.duration_homeless || 'Unknown',
          current_situation: individual.current_situation || 'Unknown',
          employment_status: individual.employment_status || 'Unemployed',
        },
        nlp_analysis: nlpAnalysis,
      });

      return response.data;
    } catch (error) {
      console.error('Error calling AI service for risk assessment:', error.message);
      throw new Error('AI service unavailable');
    }
  }

  /**
   * Optimize routes for volunteers
   */
  async optimizeRoutes(volunteers, individuals) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/routes/optimize`, {
        volunteers: volunteers.map(v => ({
          id: v.user_id?.toString(),
          name: v.name,
          lat: v.geo_lat || 0,
          lon: v.geo_lng || 0,
          capacity: v.capacity || 10,
          available_hours: v.available_hours || 8,
          transport_mode: v.transport_mode || 'driving',
        })),
        individuals: individuals.map(i => ({
          id: i.profile_id?.toString(),
          name: i.name,
          lat: i.geo_lat || 0,
          lon: i.geo_lng || 0,
          priority: this._calculatePriority(i),
        })),
      });

      return response.data;
    } catch (error) {
      console.error('Error calling AI service for route optimization:', error.message);
      throw new Error('AI service unavailable');
    }
  }

  /**
   * Provide feedback to improve AI models
   */
  async provideFeedback(resourceType, resourceId, success, outcomeScore = null) {
    try {
      await axios.post(`${AI_SERVICE_URL}/api/v1/feedback`, {
        resource_type: resourceType,
        resource_id: resourceId,
        success: success,
        outcome_score: outcomeScore,
      });

      return { success: true };
    } catch (error) {
      console.error('Error providing feedback to AI service:', error.message);
      return { success: false };
    }
  }

  /**
   * Get AI service statistics
   */
  async getStatistics() {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/api/v1/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error getting AI statistics:', error.message);
      throw new Error('AI service unavailable');
    }
  }

  /**
   * Check if AI service is healthy
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  /**
   * Calculate priority level based on individual's situation
   */
  _calculatePriority(individual) {
    // Simple priority calculation - can be enhanced
    if (individual.health_status && individual.health_status.toLowerCase().includes('critical')) {
      return 'critical';
    }
    if (individual.age < 18 || individual.age > 65) {
      return 'high';
    }
    if (individual.health_status && individual.health_status.toLowerCase().includes('chronic')) {
      return 'high';
    }
    return 'medium';
  }
}

export default new AIService();
