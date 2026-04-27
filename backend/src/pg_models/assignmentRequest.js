import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const AssignmentRequest = sequelize.define("AssignmentRequest", {
  request_id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  profile_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'HomelessProfiles',
      key: 'profile_id'
    }
  },
  shelter_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'Shelters',
      key: 'shelter_id'
    }
  },
  requested_by: { 
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  },
  status: { 
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'expired'), 
    defaultValue: 'pending' 
  },
  request_date: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  response_date: { 
    type: DataTypes.DATE 
  },
  response_by: { 
    type: DataTypes.INTEGER,
    references: {
      model: 'ShelterUsers',
      key: 'shelter_user_id'
    }
  },
  rejection_reason: { 
    type: DataTypes.TEXT 
  },
  notes: { 
    type: DataTypes.TEXT 
  }
});
