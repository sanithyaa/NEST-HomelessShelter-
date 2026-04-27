// Shelter Types
export type Shelter = {
  id: string
  name: string
  address: string
  capacity: number
  occupied: number
  phone?: string
  notes?: string
  createdAt?: string
  // Backend fields (for API compatibility)
  shelter_id?: number
  available_beds?: number
  geo_lat?: number
  geo_lng?: number
  amenities?: string
}

// Job Types
export type Job = {
  id: string
  title: string
  employer: string
  location: string
  type: string
  wage: string
  description: string
  createdAt?: string
  // Backend fields (for API compatibility)
  job_id?: number
  organization?: string
  requirements?: string
  salary?: string
  skills_required?: string
  geo_lat?: number
  geo_lng?: number
}

// Medical Records Types
export type MedicalRecord = {
  id: string
  residentId: string
  residentName: string
  date: string // ISO
  diagnosis: string
  doctor?: string
  notes?: string
  followUpDate?: string | null
}

export type MedicalFollowup = {
  id: string
  recordId: string
  residentId: string
  residentName?: string
  shelterId: string
  date: string
  notes?: string
  completed: boolean
}

// Shelter Auth Types
export type ShelterSession = {
  token: string
  role: 'Shelter'
  name: string
  email: string
  shelterId: string
}

// Shelter Dashboard Types
export type BedStats = {
  shelterId: string
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
}

export type PendingRequestSummary = {
  id: string
  residentName: string
  priority: 'High' | 'Medium' | 'Low'
  requestedAt: string
}

export type AdmissionItem = {
  id: string
  residentName: string
  admittedAt: string
}

export type DischargeItem = {
  id: string
  residentName: string
  dischargeDate: string
}

// Assignment Request Types
export type AssignmentRequest = {
  request_id: number
  profile_id: number
  shelter_id: number
  requested_by: number | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  request_date: string
  response_date?: string | null
  response_by?: number | null
  rejection_reason?: string | null
  notes?: string | null
  HomelessProfile?: {
    profile_id: number
    name: string
    age: number
    gender: string
    health_status?: string
    skills?: string
    needs?: string
    priority: 'Low' | 'Medium' | 'High' | 'Critical'
  }
  User?: {
    name: string
    email: string
  }
  // Legacy fields for backward compatibility
  id?: string
  shelterId?: string
  ngoProfileId?: string
  residentName?: string
  reason?: string
  createdAt?: string
}

// Shelter Resident Types
export type ShelterResident = {
  // Backend fields (snake_case)
  resident_id?: number
  shelter_id?: number
  ngo_profile_id?: number | null
  name: string
  alias?: string
  age?: number
  gender?: string
  health_status?: string
  disabilities?: string
  skills?: string
  admission_date?: string
  discharge_date?: string | null
  bed_number?: string | null
  room_number?: string | null
  status?: 'active' | 'discharged' | 'transferred'
  source?: 'ngo' | 'walk_in' | 'referral'
  emergency_contact?: string
  emergency_phone?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  // Legacy camelCase fields for backward compatibility
  id?: string
  shelterId?: string
  ngoProfileId?: string | null
  photoUrl?: string | null
  photo?: string | null
  admittedAt?: string
  admissionDate?: string
  bedNumber?: string | null
  medicalSummary?: string
  health?: string
  needs?: string
}

export type DailyLog = {
  id: string
  residentId: string
  shelterId: string
  createdAt: string
  note: string
  createdBy?: string
  attachments?: string[]
}
