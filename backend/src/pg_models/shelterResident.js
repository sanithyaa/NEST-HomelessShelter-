import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const ShelterResident = sequelize.define("ShelterResident", {
  resident_id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  shelter_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  ngo_profile_id: { 
    type: DataTypes.INTEGER,
    references: {
      model: 'HomelessProfiles',
      key: 'profile_id'
    }
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  age: { 
    type: DataTypes.INTEGER 
  },
  gender: { 
    type: DataTypes.STRING 
  },
  health_status: { 
    type: DataTypes.STRING 
  },
  disabilities: { 
    type: DataTypes.TEXT 
  },
  skills: { 
    type: DataTypes.STRING 
  },
  admission_date: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  discharge_date: { 
    type: DataTypes.DATE 
  },
  bed_number: { 
    type: DataTypes.STRING 
  },
  room_number: { 
    type: DataTypes.STRING 
  },
  status: { 
    type: DataTypes.ENUM('active', 'discharged', 'transferred'), 
    defaultValue: 'active' 
  },
  source: { 
    type: DataTypes.ENUM('ngo', 'walk_in', 'referral'), 
    defaultValue: 'ngo' 
  },
  emergency_contact: { 
    type: DataTypes.STRING 
  },
  emergency_phone: { 
    type: DataTypes.STRING 
  },
  notes: { 
    type: DataTypes.TEXT 
  }
});
