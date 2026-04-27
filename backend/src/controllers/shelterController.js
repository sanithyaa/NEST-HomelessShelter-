import { AssignmentRequest } from "../pg_models/assignmentRequest.js";
import { ShelterResident } from "../pg_models/shelterResident.js";
import { HomelessProfile } from "../pg_models/homelessProfile.js";
import { Shelter } from "../pg_models/shelter.js";
import { User } from "../pg_models/user.js";
import { DataSyncLog } from "../pg_models/dataSyncLog.js";

// ==================== ASSIGNMENT REQUESTS ====================

// Get all pending requests for this shelter
export async function getPendingRequests(req, res) {
  try {
    const { shelter_id } = req.shelterUser;
    
    console.log(`📥 Fetching pending requests for shelter ID: ${shelter_id}`);

    const requests = await AssignmentRequest.findAll({
      where: { 
        shelter_id,
        status: 'pending'
      },
      include: [
        {
          model: HomelessProfile,
          attributes: ['profile_id', 'name', 'age', 'gender', 'health_status', 'skills', 'needs', 'priority']
        },
        {
          model: User,
          attributes: ['name', 'email'],
          required: false // Make it optional in case requested_by is null
        }
      ],
      order: [['request_date', 'DESC']]
    });

    console.log(`✅ Found ${requests.length} pending requests for shelter ${shelter_id}`);

    res.json(requests);
  } catch (err) {
    console.error("Get pending requests error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

// Get single request details
export async function getRequestDetails(req, res) {
  try {
    const { id } = req.params;
    const { shelter_id } = req.shelterUser;

    const request = await AssignmentRequest.findOne({
      where: { 
        request_id: id,
        shelter_id // Ensure shelter can only see their own requests
      },
      include: [
        {
          model: HomelessProfile,
          attributes: ['profile_id', 'name', 'alias', 'age', 'gender', 'health_status', 'disabilities', 'skills', 'workHistory', 'needs', 'priority', 'geo_lat', 'geo_lng']
        },
        {
          model: User,
          attributes: ['name', 'email', 'role'],
          required: false // Make it optional in case requested_by is null
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    res.json(request);
  } catch (err) {
    console.error("Get request details error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

// Accept assignment request
export async function acceptRequest(req, res) {
  try {
    const { id } = req.params;
    const { shelter_id, shelter_user_id } = req.shelterUser;
    const { bed_number, room_number, notes } = req.body;

    // Find the request
    const request = await AssignmentRequest.findOne({
      where: { 
        request_id: id,
        shelter_id,
        status: 'pending'
      },
      include: [{ model: HomelessProfile }]
    });

    if (!request) {
      return res.status(404).json({ msg: "Request not found or already processed" });
    }

    // Get full profile data
    const profile = request.HomelessProfile;

    // Create resident record
    const resident = await ShelterResident.create({
      shelter_id,
      ngo_profile_id: profile.profile_id,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      health_status: profile.health_status,
      disabilities: profile.disabilities,
      skills: profile.skills,
      bed_number,
      room_number,
      status: 'active',
      source: 'ngo',
      notes
    });

    // Update request status
    await request.update({
      status: 'accepted',
      response_date: new Date(),
      response_by: shelter_user_id
    });

    // Update profile status in main DB
    await profile.update({
      status: 'shelter_assigned',
      current_shelter: (await Shelter.findByPk(shelter_id)).name,
      status_updated_at: new Date()
    });

    // Update shelter availability
    const shelter = await Shelter.findByPk(shelter_id);
    if (shelter && shelter.available_beds > 0) {
      await shelter.update({
        available_beds: shelter.available_beds - 1
      });
    }

    // Log the sync
    await DataSyncLog.create({
      profile_id: profile.profile_id,
      shelter_id,
      sync_type: 'initial',
      direction: 'ngo_to_shelter',
      fields_synced: {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        health_status: profile.health_status,
        disabilities: profile.disabilities,
        skills: profile.skills
      },
      synced_by: shelter_user_id,
      success: true
    });

    console.log(`✅ Request ${id} accepted - Resident ${resident.resident_id} created`);

    res.json({
      msg: "Request accepted successfully",
      resident,
      request
    });

  } catch (err) {
    console.error("Accept request error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}

// Reject assignment request
export async function rejectRequest(req, res) {
  try {
    const { id } = req.params;
    const { shelter_id, shelter_user_id } = req.shelterUser;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ msg: "Rejection reason required" });
    }

    const request = await AssignmentRequest.findOne({
      where: { 
        request_id: id,
        shelter_id,
        status: 'pending'
      }
    });

    if (!request) {
      return res.status(404).json({ msg: "Request not found or already processed" });
    }

    await request.update({
      status: 'rejected',
      response_date: new Date(),
      response_by: shelter_user_id,
      rejection_reason
    });

    console.log(`❌ Request ${id} rejected: ${rejection_reason}`);

    res.json({
      msg: "Request rejected",
      request
    });

  } catch (err) {
    console.error("Reject request error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

// ==================== RESIDENTS ====================

// Get all residents for this shelter
export async function getResidents(req, res) {
  try {
    const { shelter_id } = req.shelterUser;
    const { status } = req.query;

    const where = { shelter_id };
    if (status) {
      where.status = status;
    }

    const residents = await ShelterResident.findAll({
      where,
      include: [{
        model: HomelessProfile,
        attributes: ['profile_id', 'priority', 'current_job']
      }],
      order: [['admission_date', 'DESC']]
    });

    res.json(residents);
  } catch (err) {
    console.error("Get residents error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

// Get single resident details
export async function getResidentDetails(req, res) {
  try {
    const { id } = req.params;
    const { shelter_id } = req.shelterUser;

    const resident = await ShelterResident.findOne({
      where: { 
        resident_id: id,
        shelter_id
      },
      include: [{
        model: HomelessProfile,
        attributes: ['profile_id', 'priority', 'current_shelter', 'current_job', 'status']
      }]
    });

    if (!resident) {
      return res.status(404).json({ msg: "Resident not found" });
    }

    res.json(resident);
  } catch (err) {
    console.error("Get resident details error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

// Add new resident (walk-in)
export async function addResident(req, res) {
  try {
    const { shelter_id } = req.shelterUser;
    const residentData = {
      ...req.body,
      shelter_id,
      source: 'walk_in',
      status: 'active'
    };

    const resident = await ShelterResident.create(residentData);

    // Update shelter availability
    const shelter = await Shelter.findByPk(shelter_id);
    if (shelter && shelter.available_beds > 0) {
      await shelter.update({
        available_beds: shelter.available_beds - 1
      });
    }

    console.log(`✅ Walk-in resident ${resident.resident_id} added`);

    res.status(201).json({
      msg: "Resident added successfully",
      resident
    });

  } catch (err) {
    console.error("Add resident error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}

// Update resident information
export async function updateResident(req, res) {
  try {
    const { id } = req.params;
    const { shelter_id, shelter_user_id } = req.shelterUser;

    const resident = await ShelterResident.findOne({
      where: { 
        resident_id: id,
        shelter_id
      }
    });

    if (!resident) {
      return res.status(404).json({ msg: "Resident not found" });
    }

    await resident.update(req.body);

    // If this resident is linked to NGO profile, sync critical updates
    if (resident.ngo_profile_id && (req.body.health_status || req.body.status)) {
      const profile = await HomelessProfile.findByPk(resident.ngo_profile_id);
      if (profile) {
        const updateData = {};
        if (req.body.health_status) updateData.health_status = req.body.health_status;
        if (req.body.status === 'discharged') updateData.status = 'active'; // Reset to active when discharged
        
        if (Object.keys(updateData).length > 0) {
          await profile.update(updateData);
          
          // Log sync
          await DataSyncLog.create({
            profile_id: resident.ngo_profile_id,
            shelter_id,
            sync_type: 'update',
            direction: 'shelter_to_ngo',
            fields_synced: updateData,
            synced_by: shelter_user_id,
            success: true
          });
        }
      }
    }

    console.log(`✅ Resident ${id} updated`);

    res.json({
      msg: "Resident updated successfully",
      resident
    });

  } catch (err) {
    console.error("Update resident error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

// Discharge resident
export async function dischargeResident(req, res) {
  try {
    const { id } = req.params;
    const { shelter_id } = req.shelterUser;
    const { discharge_reason } = req.body;

    const resident = await ShelterResident.findOne({
      where: { 
        resident_id: id,
        shelter_id
      }
    });

    if (!resident) {
      return res.status(404).json({ msg: "Resident not found" });
    }

    await resident.update({
      status: 'discharged',
      discharge_date: new Date(),
      notes: resident.notes + `\n\nDischarged: ${discharge_reason || 'No reason provided'}`
    });

    // Update shelter availability
    const shelter = await Shelter.findByPk(shelter_id);
    if (shelter) {
      await shelter.update({
        available_beds: shelter.available_beds + 1
      });
    }

    console.log(`✅ Resident ${id} discharged`);

    res.json({
      msg: "Resident discharged successfully",
      resident
    });

  } catch (err) {
    console.error("Discharge resident error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}
