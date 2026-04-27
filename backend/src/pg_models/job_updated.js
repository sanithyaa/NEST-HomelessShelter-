// UPDATED Job model with GPS coordinates
// Replace your current job.js with this

import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const Job = sequelize.define("Job", {
  job_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  skills_required: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  organization: { type: DataTypes.STRING },
  
  // NEW: GPS coordinates (CRITICAL for location-based job matching)
  geo_lat: { type: DataTypes.FLOAT },
  geo_lng: { type: DataTypes.FLOAT },
});
