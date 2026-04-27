import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const MedicalRecord = sequelize.define("MedicalRecord", {
  record_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  profile_id: { type: DataTypes.INTEGER, allowNull: false },
  diagnosis: { type: DataTypes.STRING },
  treatment: { type: DataTypes.STRING },
  clinic_name: { type: DataTypes.STRING },
  next_visit: { type: DataTypes.DATE },
});
