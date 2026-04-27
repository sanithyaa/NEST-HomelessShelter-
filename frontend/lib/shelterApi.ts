/**
 * Shelter API Service Layer
 * Handles all communication between shelter frontend and backend
 */

const API_BASE_URL = typeof window !== 'undefined' 
  ? (window as any).ENV?.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  : 'http://localhost:5000'

// ============================================
// HELPER FUNCTIONS
// ============================================

function getShelterAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem('shelter_session')
  if (!session) return null
  try {
    const user = JSON.parse(session)
    return user.token || null
  } catch {
    return null
  }
}

async function shelterApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getShelterAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.msg || error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// ============================================
// AUTHENTICATION
// ============================================

export interface ShelterLoginData {
  email: string
  password: string
}

export interface ShelterUser {
  shelter_user_id: number
  name: string
  email: string
  role: 'manager' | 'staff' | 'medical'
  shelter_id: number
  shelter_name: string
}

export async function shelterLogin(data: ShelterLoginData): Promise<{
  token: string
  user: ShelterUser
}> {
  return shelterApiRequest('/shelter/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getShelterUserInfo(): Promise<ShelterUser> {
  return shelterApiRequest('/shelter/auth/me')
}

// ============================================
// ASSIGNMENT REQUESTS
// ============================================

export interface AssignmentRequest {
  request_id: number
  profile_id: number
  shelter_id: number
  requested_by: number
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  request_date: string
  response_date?: string
  rejection_reason?: string
  notes?: string
  HomelessProfile: {
    profile_id: number
    name: string
    age: number
    gender: string
    health_status: string
    skills: string
    needs: string
    priority: string
  }
  User: {
    name: string
    email: string
  }
}

export async function getPendingRequests(): Promise<AssignmentRequest[]> {
  return shelterApiRequest('/shelter/requests')
}

export async function getRequestDetails(requestId: number): Promise<AssignmentRequest> {
  return shelterApiRequest(`/shelter/requests/${requestId}`)
}

export async function acceptRequest(
  requestId: number, 
  data: { bed_number?: string; room_number?: string; notes?: string }
): Promise<{ msg: string; resident: any; request: any }> {
  return shelterApiRequest(`/shelter/requests/${requestId}/accept`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function rejectRequest(
  requestId: number, 
  rejection_reason: string
): Promise<{ msg: string; request: any }> {
  return shelterApiRequest(`/shelter/requests/${requestId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rejection_reason }),
  })
}

// ============================================
// RESIDENTS
// ============================================

export interface ShelterResident {
  resident_id: number
  shelter_id: number
  ngo_profile_id?: number
  name: string
  age: number
  gender: string
  health_status?: string
  disabilities?: string
  skills?: string
  admission_date: string
  discharge_date?: string
  bed_number?: string
  room_number?: string
  status: 'active' | 'discharged' | 'transferred'
  source: 'ngo' | 'walk_in' | 'referral'
  emergency_contact?: string
  emergency_phone?: string
  notes?: string
}

export async function getResidents(status?: string): Promise<ShelterResident[]> {
  const query = status ? `?status=${status}` : ''
  return shelterApiRequest(`/shelter/residents${query}`)
}

export async function getResidentDetails(residentId: number): Promise<ShelterResident> {
  return shelterApiRequest(`/shelter/residents/${residentId}`)
}

export async function addResident(data: Partial<ShelterResident>): Promise<{
  msg: string
  resident: ShelterResident
}> {
  return shelterApiRequest('/shelter/residents', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateResident(
  residentId: number, 
  data: Partial<ShelterResident>
): Promise<{ msg: string; resident: ShelterResident }> {
  return shelterApiRequest(`/shelter/residents/${residentId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function dischargeResident(
  residentId: number, 
  discharge_reason: string
): Promise<{ msg: string; resident: ShelterResident }> {
  return shelterApiRequest(`/shelter/residents/${residentId}`, {
    method: 'DELETE',
    body: JSON.stringify({ discharge_reason }),
  })
}

// ============================================
// MEDICAL RECORDS
// ============================================

export interface MedicalRecord {
  record_id: number
  resident_id: number
  record_date: string
  record_type: 'checkup' | 'medication' | 'incident' | 'note'
  description: string
  medications?: string
  doctor_name?: string
  follow_up_date?: string
  recorded_by: number
  sync_to_ngo: boolean
  synced_at?: string
}

export async function getResidentMedicalRecords(residentId: number): Promise<MedicalRecord[]> {
  return shelterApiRequest(`/shelter/medical/residents/${residentId}`)
}

export async function addMedicalRecord(
  residentId: number, 
  data: Partial<MedicalRecord>
): Promise<{ msg: string; record: MedicalRecord }> {
  return shelterApiRequest(`/shelter/medical/residents/${residentId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateMedicalRecord(
  recordId: number, 
  data: Partial<MedicalRecord>
): Promise<{ msg: string; record: MedicalRecord }> {
  return shelterApiRequest(`/shelter/medical/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function getSyncStatus(): Promise<{
  stats: {
    total: number
    successful: number
    failed: number
    last_sync: string | null
  }
  recent_syncs: any[]
}> {
  return shelterApiRequest('/shelter/medical/sync/status')
}

// ============================================
// EXPORT ALL
// ============================================

export const shelterApi = {
  // Auth
  shelterLogin,
  getShelterUserInfo,
  
  // Requests
  getPendingRequests,
  getRequestDetails,
  acceptRequest,
  rejectRequest,
  
  // Residents
  getResidents,
  getResidentDetails,
  addResident,
  updateResident,
  dischargeResident,
  
  // Medical
  getResidentMedicalRecords,
  addMedicalRecord,
  updateMedicalRecord,
  getSyncStatus,
}

export default shelterApi
