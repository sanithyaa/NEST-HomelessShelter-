import { ShelterMedicalRecord } from "../pg_models/shelterMedicalRecord.js";
import { ShelterResident } from "../pg_models/shelterResident.js";
import { HomelessProfile } from "../pg_models/homelessProfile.js";
import { MedicalRecord } from "../pg_models/medicalRecord.js";
import { DataSyncLog } from "../pg_models/dataSyncLog.js";

// Get medical records for a resident
export async function getResidentMedicalRecords(req, res) {
  try {
    const { resident_id } = req.params;
    const { shelter_id } = req.shelterUser;

    // Verify resident belongs to this shelter
    const resident = await ShelterResident.findOne({
      where: { resident_id, shelter_id }
    });

    if (!resident) {
      return res.status(404).json({ msg: "Resident not found" });
    }

    const records = await ShelterMedicalRecord.findAll({
      where: { resident_id },
      order: [['record_date', 'DESC']]
    });

    res.json(records);
  } catch (err) {
    console.error("Get medical records error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

// Add medical record
export async function addMedicalRecord(req, res) {
  try {
    const { resident_id } = req.params;
    const { shelter_id, shelter_user_id } = req.shelterUser;
    const { record_type, description, medications, doctor_name, follow_up_date, sync_to_ngo } = req.body;

    // Verify resident belongs to this shelter
    const resident = await ShelterResident.findOne({
      where: { resident_id, shelter_id }
    });

    if (!resident) {
      return res.status(404).json({ msg: "Resident not found" });
    }

    // Create medical record
    const record = await ShelterMedicalRecord.create({
      resident_id,
      record_type,
      description,
      medications,
      doctor_name,
      follow_up_date,
      recorded_by: shelter_user_id,
      sync_to_ngo: sync_to_ngo !== false // Default to true
    });

    // Sync to NGO if requested and resident is linked to NGO profile
    if (record.sync_to_ngo && resident.ngo_profile_id) {
      try {
        // Update health status in main profile
        const profile = await HomelessProfile.findByPk(resident.ngo_profile_id);
        if (profile) {
          // Create medical record in main DB
          await MedicalRecord.create({
            profile_id: resident.ngo_profile_id,
            record_type: record_type,
            description: `[From ${(await resident.getShelter()).name}] ${description}`,
            medications,
            doctor_name,
            follow_up_date,
            recorded_by: null // Shelter staff, not NGO user
          });

          // Update health status if it's a significant update
          if (record_type === 'checkup' || record_type === 'incident') {
            await profile.update({
              health_status: description.substring(0, 255) // Truncate if too long
            });
          }

          // Log sync
          await DataSyncLog.create({
            profile_id: resident.ngo_profile_id,
            shelter_id,
            sync_type: 'medical',
            direction: 'shelter_to_ngo',
            fields_synced: {
              record_type,
              description,
              medications
            },
            synced_by: shelter_user_id,
            success: true
          });

          // Mark as synced
          await record.update({ synced_at: new Date() });

          console.log(`✅ Medical record synced to NGO profile ${resident.ngo_profile_id}`);
        }
      } catch (syncErr) {
        console.error("Medical record sync error:", syncErr.message);
        // Don't fail the request, just log the error
        await DataSyncLog.create({
          profile_id: resident.ngo_profile_id,
          shelter_id,
          sync_type: 'medical',
          direction: 'shelter_to_ngo',
          synced_by: shelter_user_id,
          success: false,
          error_message: syncErr.message
        });
      }
    }

    console.log(`✅ Medical record ${record.record_id} added for resident ${resident_id}`);

    res.status(201).json({
      msg: "Medical record added successfully",
      record
    });

  } catch (err) {
    console.error("Add medical record error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}

// Update medical record
export async function updateMedicalRecord(req, res) {
  try {
    const { record_id } = req.params;
    const { shelter_id } = req.shelterUser;

    // Find record and verify it belongs to this shelter
    const record = await ShelterMedicalRecord.findOne({
      where: { record_id },
      include: [{
        model: ShelterResident,
        where: { shelter_id }
      }]
    });

    if (!record) {
      return res.status(404).json({ msg: "Medical record not found" });
    }

    await record.update(req.body);

    console.log(`✅ Medical record ${record_id} updated`);

    res.json({
      msg: "Medical record updated successfully",
      record
    });

  } catch (err) {
    console.error("Update medical record error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

// Get sync status
export async function getSyncStatus(req, res) {
  try {
    const { shelter_id } = req.shelterUser;

    const recentSyncs = await DataSyncLog.findAll({
      where: { shelter_id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const stats = {
      total: recentSyncs.length,
      successful: recentSyncs.filter(s => s.success).length,
      failed: recentSyncs.filter(s => !s.success).length,
      last_sync: recentSyncs[0]?.createdAt || null
    };

    res.json({
      stats,
      recent_syncs: recentSyncs
    });

  } catch (err) {
    console.error("Get sync status error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}
