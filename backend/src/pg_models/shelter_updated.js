// UPDATED Shelter model with amenities
// Replace your current shelter.js with this

import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const Shelter = sequelize.define("Shelter", {
  shelter_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING },
  capacity: { type: DataTypes.INTEGER },
  available_beds: { type: DataTypes.INTEGER },
  geo_lat: { type: DataTypes.FLOAT },
  geo_lng: { type: DataTypes.FLOAT },
  
  // NEW: Amenities (helps with better matching)
  amenities: { type: DataTypes.TEXT },
});
