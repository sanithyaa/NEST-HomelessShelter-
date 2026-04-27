import mongoose from "mongoose";

const schema = new mongoose.Schema({
  profile_id: { type: Number, required: true, index: true },
  recommendation_type: { 
    type: String, 
    enum: ['shelter', 'job', 'training', 'risk_assessment', 'route'],
    required: true 
  },
  recommendations: { type: Array, default: [] },
  risk_data: { type: Object },
  urgency_score: { type: Number, default: 0 },
  feedback: {
    success: Boolean,
    outcome_score: Number,
    feedback_date: Date,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Index for faster queries
schema.index({ profile_id: 1, recommendation_type: 1, created_at: -1 });

export const AIRecommendation = mongoose.model("AIRecommendation", schema);
