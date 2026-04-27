import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const User = sequelize.define("User", {
  user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, //Prmary Key
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("admin", "volunteer", "ngo","shelter"), defaultValue: "volunteer" },
});
