import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const Shelter = sequelize.define("Shelter", {
  shelter_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },// PK
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING },
  capacity: { type: DataTypes.INTEGER },
  available_beds: { type: DataTypes.INTEGER },
  geo_lat: { type: DataTypes.FLOAT },
  geo_lng: { type: DataTypes.FLOAT },
});
