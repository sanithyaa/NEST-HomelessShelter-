import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const Allocation = sequelize.define("Allocation", {
  alloc_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  profile_id: { type: DataTypes.INTEGER, allowNull: false },
  shelter_id: { type: DataTypes.INTEGER },
  job_id: { type: DataTypes.INTEGER },
  resource_type: { type: DataTypes.ENUM('shelter', 'job'), allowNull: false },
  resource_name: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "assigned" },
  assigned_by: { type: DataTypes.INTEGER }, // FK to User
  assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});