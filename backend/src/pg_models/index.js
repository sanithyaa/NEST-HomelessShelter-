// src/pg_models/index.js

// Import models (remove the duplicate side-effect imports)
import { User } from "./user.js";
import { HomelessProfile } from "./homelessProfile.js";
import { Shelter } from "./shelter.js";
import { Job } from "./job.js";
import { Allocation } from "./allocation.js";
import { MedicalRecord } from "./medicalRecord.js";

// Import shelter management models
import { ShelterUser } from "./shelterUser.js";
import { ShelterResident } from "./shelterResident.js";
import { ShelterMedicalRecord } from "./shelterMedicalRecord.js";
import { AssignmentRequest } from "./assignmentRequest.js";
import { DataSyncLog } from "./dataSyncLog.js";

// Define associations here
User.hasMany(HomelessProfile, { foreignKey: "registered_by" });
HomelessProfile.belongsTo(User, { foreignKey: "registered_by" });

HomelessProfile.hasMany(Allocation, { foreignKey: "profile_id" });
Allocation.belongsTo(HomelessProfile, { foreignKey: "profile_id" });

Shelter.hasMany(Allocation, { foreignKey: "shelter_id" });
Allocation.belongsTo(Shelter, { foreignKey: "shelter_id" });

Job.hasMany(Allocation, { foreignKey: "job_id" });
Allocation.belongsTo(Job, { foreignKey: "job_id" });

HomelessProfile.hasMany(MedicalRecord, { foreignKey: "profile_id" });
MedicalRecord.belongsTo(HomelessProfile, { foreignKey: "profile_id" });

// Shelter Management Associations
Shelter.hasMany(ShelterUser, { foreignKey: "shelter_id" });
ShelterUser.belongsTo(Shelter, { foreignKey: "shelter_id" });

Shelter.hasMany(ShelterResident, { foreignKey: "shelter_id" });
ShelterResident.belongsTo(Shelter, { foreignKey: "shelter_id" });

HomelessProfile.hasOne(ShelterResident, { foreignKey: "ngo_profile_id" });
ShelterResident.belongsTo(HomelessProfile, { foreignKey: "ngo_profile_id" });

ShelterResident.hasMany(ShelterMedicalRecord, { foreignKey: "resident_id" });
ShelterMedicalRecord.belongsTo(ShelterResident, { foreignKey: "resident_id" });

ShelterUser.hasMany(ShelterMedicalRecord, { foreignKey: "recorded_by" });
ShelterMedicalRecord.belongsTo(ShelterUser, { foreignKey: "recorded_by" });

HomelessProfile.hasMany(AssignmentRequest, { foreignKey: "profile_id" });
AssignmentRequest.belongsTo(HomelessProfile, { foreignKey: "profile_id" });

Shelter.hasMany(AssignmentRequest, { foreignKey: "shelter_id" });
AssignmentRequest.belongsTo(Shelter, { foreignKey: "shelter_id" });

User.hasMany(AssignmentRequest, { foreignKey: "requested_by" });
AssignmentRequest.belongsTo(User, { foreignKey: "requested_by" });

ShelterUser.hasMany(AssignmentRequest, { foreignKey: "response_by" });
AssignmentRequest.belongsTo(ShelterUser, { foreignKey: "response_by" });

console.log("✅ Models imported and associations created");

// Export all models for use elsewhere if needed
export { 
  User, HomelessProfile, Shelter, Job, Allocation, MedicalRecord,
  ShelterUser, ShelterResident, ShelterMedicalRecord, AssignmentRequest, DataSyncLog
};