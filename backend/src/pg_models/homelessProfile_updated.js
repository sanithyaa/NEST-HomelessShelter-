// UPDATED HomelessProfile model with AI fields
// Replace your current homelessProfile.js with this

import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const HomelessProfile = sequelize.define("HomelessProfile", {
  profile_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER },
  gender: { type: DataTypes.STRING },
  health_status: { type: DataTypes.STRING },
  education: { type: DataTypes.STRING },
  skills: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  registered_by: { type: DataTypes.INTEGER },
  
  // ============================================
  // NEW: GPS coordinates (CRITICAL for AI)
  // ============================================
  geo_lat: { type: DataTypes.FLOAT },
  geo_lng: { type: DataTypes.FLOAT },
  
  // ============================================
  // NEW: Employment & housing info (IMPORTANT)
  // ============================================
  duration_homeless: { type: DataTypes.STRING },
  current_situation: { type: DataTypes.STRING, defaultValue: 'Unknown' },
  employment_status: { type: DataTypes.STRING, defaultValue: 'Unemployed' },
  work_experience_years: { type: DataTypes.INTEGER, defaultValue: 0 },
  
  // ============================================
  // NEW: Resource access flags (HELPFUL)
  // ============================================
  has_transportation: { type: DataTypes.BOOLEAN, defaultValue: false },
  has_phone: { type: DataTypes.BOOLEAN, defaultValue: false },
  has_id: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  // ============================================
  // NEW: Health flags (OPTIONAL but useful)
  // ============================================
  substance_abuse: { type: DataTypes.BOOLEAN, defaultValue: false },
  mental_health_issues: { type: DataTypes.BOOLEAN, defaultValue: false },
  chronic_health_conditions: { type: DataTypes.BOOLEAN, defaultValue: false },
  family_support: { type: DataTypes.BOOLEAN, defaultValue: false },
});
