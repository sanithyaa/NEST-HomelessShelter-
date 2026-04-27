import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const Job = sequelize.define("Job", {
  job_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  skills_required: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  organization: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING }, // Full-time, Part-time
  salary: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
});
