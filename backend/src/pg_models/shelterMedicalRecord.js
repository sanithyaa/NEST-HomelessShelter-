import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const ShelterMedicalRecord = sequelize.define("ShelterMedicalRecord", {
  record_id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  resident_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'ShelterResidents',
      key: 'resident_id'
    }
  },
  record_date: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  record_type: { 
    type: DataTypes.ENUM('checkup', 'medication', 'incident', 'note'), 
    defaultValue: 'note' 
  },
  description: { 
    type: DataTypes.TEXT 
  },
  medications: { 
    type: DataTypes.TEXT 
  },
  doctor_name: { 
    type: DataTypes.STRING 
  },
  follow_up_date: { 
    type: DataTypes.DATE 
  },
  recorded_by: { 
    type: DataTypes.INTEGER,
    references: {
      model: 'ShelterUsers',
      key: 'shelter_user_id'
    }
  },
  sync_to_ngo: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  synced_at: { 
    type: DataTypes.DATE 
  }
});
