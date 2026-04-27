import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const ShelterUser = sequelize.define("ShelterUser", {
  shelter_user_id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  shelter_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'Shelters',
      key: 'shelter_id'
    }
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  password_hash: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: { 
    type: DataTypes.ENUM('manager', 'staff', 'medical'), 
    defaultValue: 'staff' 
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});
