// UPDATED User model with volunteer fields
// Replace your current user.js with this

import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const User = sequelize.define("User", {
  user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("admin", "volunteer", "ngo", "shelter"), defaultValue: "volunteer" },
  
  // NEW: GPS coordinates (for volunteers doing outreach)
  geo_lat: { type: DataTypes.FLOAT },
  geo_lng: { type: DataTypes.FLOAT },
  
  // NEW: Volunteer capacity fields (for route optimization)
  capacity: { type: DataTypes.INTEGER, defaultValue: 10 },
  available_hours: { type: DataTypes.INTEGER, defaultValue: 8 },
  transport_mode: { type: DataTypes.STRING, defaultValue: 'driving' },
});
