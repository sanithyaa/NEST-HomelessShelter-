import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const HomelessProfile = sequelize.define("HomelessProfile", {
  profile_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },//PK
  name: { type: DataTypes.STRING, allowNull: false },
  alias: { type: DataTypes.STRING },
  age: { type: DataTypes.INTEGER },
  gender: { type: DataTypes.STRING },
  health_status: { type: DataTypes.STRING },
  disabilities: { type: DataTypes.TEXT },
  education: { type: DataTypes.STRING },
  skills: { type: DataTypes.STRING },
  workHistory: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING },
  geo_lat: { type: DataTypes.FLOAT },
  geo_lng: { type: DataTypes.FLOAT },
  needs: { type: DataTypes.TEXT },
  priority: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), defaultValue: 'Medium' },
  status: { 
    type: DataTypes.ENUM(
      'active',           // Just registered, looking for help
      'shelter_requested', // Request sent to shelter
      'job_requested',    // Request sent to job organization
      'both_requested',   // Requests sent for both shelter and job
      'shelter_assigned', // Accepted into shelter
      'job_assigned',     // Got the job
      'completed',        // Successfully housed and employed
      'inactive'          // No longer seeking help
    ), 
    defaultValue: 'active' 
  },
  current_shelter: { type: DataTypes.STRING }, // Name of assigned shelter
  current_job: { type: DataTypes.STRING },     // Name of assigned job
  status_updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  registered_by: { type: DataTypes.INTEGER }, // FK -> User.user_id
});
