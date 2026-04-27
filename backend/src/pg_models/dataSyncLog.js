import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

export const DataSyncLog = sequelize.define("DataSyncLog", {
  sync_id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  profile_id: { 
    type: DataTypes.INTEGER 
  },
  shelter_id: { 
    type: DataTypes.INTEGER 
  },
  sync_type: { 
    type: DataTypes.ENUM('initial', 'update', 'medical', 'status'), 
    allowNull: false 
  },
  direction: { 
    type: DataTypes.ENUM('ngo_to_shelter', 'shelter_to_ngo'), 
    allowNull: false 
  },
  fields_synced: { 
    type: DataTypes.JSON 
  },
  synced_by: { 
    type: DataTypes.INTEGER 
  },
  success: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  error_message: { 
    type: DataTypes.TEXT 
  }
});
