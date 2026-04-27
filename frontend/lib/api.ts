/**
 * API Service Layer
 * Handles all communication between frontend and backend
 * 
 * INTEGRATION NOTE: This file connects the Next.js frontend with the Node.js backend
 * and GPU-accelerated AI service for homeless aid recommendations
 */

import { enqueueShelterAction } from './offline'

const API_BASE_URL = typeof window !== 'undefined' 
  ? (window as any).ENV?.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  : 'http://localhost:5000'

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get auth token from session
 * INTEGRATION: Uses localStorage session for authentication
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem('session')
  if (!session) return null
  try {
    const user = JSON.parse(session)
    return user.token || null
  } catch {
    return null
  }
}

/**
 * Make authenticated API request
 * INTEGRATION: Adds JWT token to all requests
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // Merge with any existing headers
  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Make shelter API request with offline detection
 * Queues actions when offline for later sync
 * INTEGRATION: Supports offline-first shelter operations
 */
async function shelterApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  actionType?: string
): Promise<T | { queued: true }> {
  // Check if online
  if (typeof window !== 'undefined' && !navigator.onLine) {
    // Queue action for later sync
    await enqueueShelterAction({
      type: actionType || 'shelter_action',
      endpoint,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body as string) : null,
    })
    
    return { queued: true } as { queued: true }
  }
  
  // If online, proceed with normal request
  return apiRequest<T>(endpoint, options)
}

// ============================================
// PROFILE API
// ============================================

export interface CreateProfileData {
  name: string
  alias?: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  location?: {
    lat: number
    lng: number
  }
  locationName?: string
  health?: string
  disabilities?: string
  skills?: string
  workHistory?: string
  needs: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
}

export interface Profile extends CreateProfileData {
  profile_id: number
  registered_by: number
  createdAt: string
  updatedAt: string
  // AI-enhanced fields
  geo_lat?: number
  geo_lng?: number
  employment_status?: string
  duration_homeless?: string
  current_situation?: string
  health_status?: string
  status?: string
  current_shelter?: string
  current_job?: string
  status_updated_at?: string
}

/**
 * Create a new homeless profile
 * INTEGRATION: Saves to PostgreSQL and triggers AI analysis
 */
export async function createProfile(data: CreateProfileData): Promise<Profile> {
  return apiRequest<Profile>('/profiles', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      // Map frontend fields to backend fields
      geo_lat: data.location?.lat,
      geo_lng: data.location?.lng,
      location: data.locationName,
      health_status: data.health,
      education: 'Unknown', // Can be added to form later
    }),
  })
}

/**
 * Get all profiles
 * INTEGRATION: Fetches from PostgreSQL
 */
export async function getProfiles(): Promise<Profile[]> {
  return apiRequest<Profile[]>('/profiles')
}

/**
 * Get single profile by ID
 * INTEGRATION: Fetches from PostgreSQL with AI analysis data
 */
export async function getProfile(id: number): Promise<Profile> {
  return apiRequest<Profile>(`/profiles/${id}`)
}

// ============================================
// FOLLOWUPS API
// ============================================

export interface Followup {
  id: string
  profileId: string
  type: string
  note: string
  date: string
  completed: boolean
  createdBy?: string
}

/**
 * Get followups for a profile
 * NOTE: This is a placeholder - backend endpoint not yet implemented
 */
export async function getFollowups(profileId: string): Promise<Followup[]> {
  // TODO: Implement backend endpoint for followups
  // For now, return empty array to prevent errors
  return []
}

/**
 * Update a followup
 * NOTE: This is a placeholder - backend endpoint not yet implemented
 */
export async function updateFollowup(id: string, data: Partial<Followup>): Promise<Followup> {
  // TODO: Implement backend endpoint for followups
  throw new Error('Followup updates not yet implemented')
}

// ============================================
// AI RECOMMENDATIONS API
// ============================================

export interface AIRecommendation {
  resource_id: string
  resource_name: string
  resource_type: string
  score: number
  explanation: {
    location_score: number
    skill_match_score: number
    availability_score: number
    priority_score: number
    historical_score: number
  }
  resource_details: any
}

export interface AIRecommendationsResponse {
  profile_id: number
  profile_name: string
  recommendations: AIRecommendation[]
  total_shelters_analyzed?: number
  total_jobs_analyzed?: number
}

/**
 * Get AI-powered shelter recommendations for a profile
 * INTEGRATION: Calls GPU-accelerated AI service via backend
 * Uses location-based matching, availability, and historical success rates
 */
export async function getShelterRecommendations(
  profileId: number,
  topK: number = 5
): Promise<AIRecommendationsResponse> {
  return apiRequest<AIRecommendationsResponse>(
    `/ai/recommendations/shelters/${profileId}?top_k=${topK}`
  )
}

/**
 * Get AI-powered job recommendations for a profile
 * INTEGRATION: Calls GPU-accelerated AI service via backend
 * Uses skill matching, location, and work history
 */
export async function getJobRecommendations(
  profileId: number,
  topK: number = 5
): Promise<AIRecommendationsResponse> {
  return apiRequest<AIRecommendationsResponse>(
    `/ai/recommendations/jobs/${profileId}?top_k=${topK}`
  )
}

/**
 * Analyze volunteer notes using NLP
 * INTEGRATION: Uses GPU-accelerated NLP models to extract:
 * - Skills mentioned
 * - Health concerns
 * - Urgency level
 * - Sentiment analysis
 */
export async function analyzeNotes(
  profileId: number,
  notes: string
): Promise<{
  profile_id: number
  analysis: {
    skills: string[]
    health_concerns: {
      mental?: string[]
      physical?: string[]
      substance?: string[]
    }
    urgency_level: string
    sentiment: {
      label: string
      score: number
      mental_health_risk: string
    }
    needs_categories: {
      immediate?: string[]
      short_term?: string[]
      long_term?: string[]
    }
  }
  profile_updated: boolean
}> {
  return apiRequest(`/ai/analyze/notes/${profileId}`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}

/**
 * Get comprehensive risk assessment for a profile
 * INTEGRATION: Uses GPU-accelerated risk prediction models
 * Predicts:
 * - Job placement success likelihood
 * - Chronic homelessness risk
 * - Need for immediate intervention
 */
export async function getRiskAssessment(profileId: number): Promise<{
  profile_id: number
  profile_name: string
  risk_assessment: {
    job_placement: {
      probability: number
      risk_level: string
      factors: string[]
      recommendations: string[]
    }
    chronic_homelessness: {
      probability: number
      risk_level: string
      factors: string[]
      interventions: string[]
    }
    immediate_intervention: {
      requires_intervention: boolean
      urgency: string
      probability: number
      reasons: string[]
      immediate_actions: string[]
    }
    overall_risk_score: number
  }
}> {
  return apiRequest(`/ai/risk/assess/${profileId}`)
}

/**
 * Provide feedback on AI recommendations
 * INTEGRATION: Helps AI learn and improve over time
 * The MultiArmedBandit model uses this to optimize future recommendations
 */
export async function provideFeedback(data: {
  resource_type: 'shelter' | 'job' | 'training'
  resource_id: string
  success: boolean
  outcome_score?: number
}): Promise<{ message: string }> {
  return apiRequest('/ai/feedback', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Get AI service statistics
 * INTEGRATION: Shows AI performance metrics and learning progress
 */
export async function getAIStatistics(): Promise<{
  ai_service: {
    bandit_stats: any
    epsilon: number
    device: string
  }
  database: {
    total_profiles: number
    total_shelters: number
    total_jobs: number
    total_recommendations: number
  }
}> {
  return apiRequest('/ai/statistics')
}

/**
 * Check AI service health
 * INTEGRATION: Verifies GPU-accelerated AI service is running
 */
export async function checkAIHealth(): Promise<{
  status: string
  service: string
}> {
  return apiRequest('/ai/health')
}

// ============================================
// SHELTERS API
// ============================================

export interface Shelter {
  shelter_id: number
  name: string
  address: string
  capacity: number
  available_beds: number
  geo_lat: number
  geo_lng: number
  amenities?: string
}

/**
 * Get all shelters
 * INTEGRATION: Fetches from PostgreSQL
 */
export async function getShelters(): Promise<Shelter[]> {
  return apiRequest<Shelter[]>('/shelters')
}

/**
 * Create a new shelter
 */
export async function createShelter(data: Omit<Shelter, 'shelter_id'>): Promise<Shelter> {
  return apiRequest<Shelter>('/shelters', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a shelter
 */
export async function updateShelter(id: string, data: Partial<Shelter>): Promise<Shelter> {
  return apiRequest<Shelter>(`/shelters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a shelter
 */
export async function deleteShelter(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/shelters/${id}`, {
    method: 'DELETE',
  })
}

// ============================================
// JOBS API
// ============================================

export interface Job {
  job_id: number
  title: string
  skills_required: string
  location: string
  organization: string
  geo_lat?: number
  geo_lng?: number
}

/**
 * Get all jobs
 * INTEGRATION: Fetches from PostgreSQL
 */
export async function getJobs(): Promise<Job[]> {
  return apiRequest<Job[]>('/jobs')
}

/**
 * Create a new job
 */
export async function createJob(data: Omit<Job, 'job_id'>): Promise<Job> {
  return apiRequest<Job>('/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a job
 */
export async function updateJob(id: string, data: Partial<Job>): Promise<Job> {
  return apiRequest<Job>(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a job
 */
export async function deleteJob(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/jobs/${id}`, {
    method: 'DELETE',
  })
}

// ============================================
// ASSIGNMENTS API
// ============================================

/**
 * Request assignment of a resource to a profile
 */
export async function requestAssignment(
  type: 'shelter' | 'job',
  resourceId: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/assignments', {
    method: 'POST',
    body: JSON.stringify({ type, resourceId }),
  })
}

// ============================================
// EXPORT ALL
// ============================================

export const api = {
  // Profiles
  createProfile,
  getProfiles,
  getProfile,
  
  // AI Recommendations
  getShelterRecommendations,
  getJobRecommendations,
  analyzeNotes,
  getRiskAssessment,
  provideFeedback,
  getAIStatistics,
  checkAIHealth,
  
  // Resources
  getShelters,
  createShelter,
  updateShelter,
  deleteShelter,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  
  // Assignments
  requestAssignment,
}

export default api


// Shelter API
export interface ShelterStats {
  totalBeds: number
  bedsOccupied: number
  pendingRequests: number
  recentAdmissions: Array<{
    id: number
    name: string
    date: string
  }>
  upcomingDischarges: Array<{
    id: number
    name: string
    dischargeDate: string
  }>
}

export async function getShelterStats(): Promise<ShelterStats> {
  const response = await fetch('/api/shelter/stats')
  if (!response.ok) throw new Error('Failed to fetch shelter stats')
  return response.json()
}


// Shelter Requests API
export interface ShelterRequest {
  id: string
  profileId: string
  name: string
  age: number
  gender: string
  submittedBy: string
  priority: 'High' | 'Medium' | 'Low'
  reason: string
  date: string
  health?: string
  skills?: string
  needs?: string
  location?: { lat: number; lng: number }
  locationName?: string
}

export async function getShelterRequests(): Promise<ShelterRequest[]> {
  const response = await fetch('/api/shelter/requests')
  if (!response.ok) throw new Error('Failed to fetch shelter requests')
  return response.json()
}

export async function acceptRequest(id: string, notes?: string): Promise<{ success: boolean } | { queued: true }> {
  return shelterApiRequest<{ success: boolean }>(
    `/api/shelter/requests/${id}/accept`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    },
    'accept_request'
  )
}

export async function rejectRequest(id: string, reason: string): Promise<{ success: boolean } | { queued: true }> {
  return shelterApiRequest<{ success: boolean }>(
    `/api/shelter/requests/${id}/reject`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    },
    'reject_request'
  )
}


// Shelter Residents API
export interface ShelterResident {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  admissionDate: string
  bedNumber: string
  notes?: string
  health?: string
  skills?: string
  needs?: string
  dailyLogs?: Array<{
    id: string
    timestamp: string
    note: string
    createdBy: string
  }>
}

export async function getShelterResidents(): Promise<ShelterResident[]> {
  const response = await fetch('/api/shelter/residents')
  if (!response.ok) throw new Error('Failed to fetch shelter residents')
  return response.json()
}

export async function getShelterResident(id: string): Promise<ShelterResident> {
  const response = await fetch(`/api/shelter/residents/${id}`)
  if (!response.ok) throw new Error('Failed to fetch shelter resident')
  return response.json()
}

export async function addShelterResident(
  data: Omit<ShelterResident, 'id' | 'dailyLogs'>
): Promise<ShelterResident | { queued: true }> {
  return shelterApiRequest<ShelterResident>(
    '/api/shelter/residents',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    'add_resident'
  )
}

/**
 * Create a walk-in resident with optional photo and intake notes
 * INTEGRATION: Dedicated endpoint for walk-in admissions
 */
export async function createWalkInResident(payload: {
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  shelterId: string
  photo?: string
  notes?: string
}): Promise<ShelterResident> {
  const response = await fetch('/api/shelter/residents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create resident' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}


// Medical Records API
import { MedicalRecord, MedicalFollowup } from './types'

export async function fetchMedicalRecords(residentId?: string): Promise<MedicalRecord[]> {
  const url = residentId
    ? `/api/shelter/medical?residentId=${residentId}`
    : `/api/shelter/medical`
  const r = await fetch(url)
  if (!r.ok) throw new Error('Failed to fetch medical records')
  return r.json()
}

export async function createMedicalRecord(
  payload: Partial<MedicalRecord>
): Promise<MedicalRecord> {
  const response = await fetch(`/api/shelter/medical`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create medical record' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}

export async function scheduleMedicalFollowup(
  recordId: string,
  payload: { date: string; notes?: string; residentId: string }
): Promise<MedicalFollowup | { queued: true }> {
  return shelterApiRequest<MedicalFollowup>(
    `/api/shelter/medical/${recordId}/followups`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'schedule_followup'
  )
}

export async function fetchMedicalFollowups(date?: string): Promise<MedicalFollowup[]> {
  const url = date
    ? `/api/shelter/medical/followups?date=${date}`
    : `/api/shelter/medical/followups`
  const r = await fetch(url)
  if (!r.ok) throw new Error('Failed to fetch followups')
  return r.json()
}

export async function toggleMedicalFollowupComplete(
  id: string,
  completed: boolean
): Promise<MedicalFollowup | { queued: true }> {
  return shelterApiRequest<MedicalFollowup>(
    `/api/shelter/medical/followups/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    },
    'toggle_followup_complete'
  )
}

export async function fetchFollowupsByShelterId(shelterId: string): Promise<MedicalFollowup[]> {
  const r = await fetch(`/api/shelter/medical/followups?shelterId=${shelterId}`)
  if (!r.ok) throw new Error('Failed to fetch followups')
  return r.json()
}

export async function scheduleFollowup(payload: {
  recordId: string
  residentId: string
  residentName: string
  shelterId: string
  date: string
  notes?: string
}): Promise<MedicalFollowup> {
  const response = await fetch(`/api/shelter/medical/followups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to schedule followup' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}

export async function markFollowupCompleted(id: string): Promise<MedicalFollowup> {
  const response = await fetch(`/api/shelter/medical/followups/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to mark followup complete' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}


// ============================================
// SHELTER AUTH API
// ============================================

export interface ShelterLoginData {
  email: string
  password: string
  shelterId?: string
}

export interface ShelterRegisterData {
  name: string
  email: string
  password: string
  shelterId: string
  role: 'Shelter'
}

export interface ShelterAuthResponse {
  token: string
  role: 'Shelter'
  name: string
  email: string
  shelterId: string
}

/**
 * Shelter staff login
 */
export async function shelterAuthLogin(data: ShelterLoginData): Promise<ShelterAuthResponse> {
  const response = await fetch('/api/shelter/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Login failed')
  }

  return response.json()
}

/**
 * Shelter staff registration
 */
export async function shelterAuthRegister(data: ShelterRegisterData): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/shelter/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Registration failed')
  }

  return response.json()
}


// ============================================
// SHELTER DASHBOARD API
// ============================================

export async function fetchShelterBedStats(shelterId: string) {
  const r = await fetch(`/api/shelter/dashboard/bed-stats?shelterId=${shelterId}`)
  if (!r.ok) throw new Error('Failed to fetch bed stats')
  return r.json()
}

export async function fetchShelterPendingRequests(shelterId: string) {
  const r = await fetch(`/api/shelter/dashboard/pending-requests?shelterId=${shelterId}`)
  if (!r.ok) throw new Error('Failed to fetch pending requests')
  return r.json()
}

export async function fetchRecentAdmissions(shelterId: string) {
  const r = await fetch(`/api/shelter/dashboard/recent-admissions?shelterId=${shelterId}`)
  if (!r.ok) throw new Error('Failed to fetch recent admissions')
  return r.json()
}

export async function fetchUpcomingDischarges(shelterId: string) {
  const r = await fetch(`/api/shelter/dashboard/upcoming-discharges?shelterId=${shelterId}`)
  if (!r.ok) throw new Error('Failed to fetch upcoming discharges')
  return r.json()
}


export async function createShelterResident(payload: any) {
  const r = await fetch(`/api/shelter/residents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error('Failed to create resident')
  return r.json()
}


// ============================================
// SHELTER RESIDENTS API
// ============================================

export async function fetchShelterResidents(shelterId: string) {
  const r = await fetch(`/api/shelter/residents?shelterId=${shelterId}`)
  if (!r.ok) throw new Error('Failed to fetch residents')
  return r.json()
}

export async function fetchShelterResidentById(id: string) {
  const r = await fetch(`/api/shelter/residents/${id}`)
  if (!r.ok) throw new Error('Failed to fetch resident')
  return r.json()
}

export async function updateShelterResident(id: string, payload: any) {
  const r = await fetch(`/api/shelter/residents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error('Failed to update resident')
  return r.json()
}

export async function deleteShelterResident(id: string) {
  const r = await fetch(`/api/shelter/residents/${id}`, { method: 'DELETE' })
  if (!r.ok) throw new Error('Failed to delete resident')
  return r.json()
}

// Daily Logs
export async function fetchDailyLogs(residentId: string) {
  const r = await fetch(`/api/shelter/residents/${residentId}/logs`)
  if (!r.ok) throw new Error('Failed to fetch daily logs')
  return r.json()
}

export async function createDailyLog(residentId: string, payload: any) {
  const r = await fetch(`/api/shelter/residents/${residentId}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error('Failed to create daily log')
  return r.json()
}


// ============================================
// SHELTER REQUESTS API
// ============================================

export async function fetchShelterRequests(shelterId: string) {
  const r = await fetch(`/api/shelter/requests?shelterId=${shelterId}`)
  if (!r.ok) throw new Error('Failed to fetch shelter requests')
  return r.json()
}

export async function acceptShelterRequest(id: string) {
  const r = await fetch(`/api/shelter/requests/${id}/accept`, { method: 'POST' })
  if (!r.ok) throw new Error('Failed to accept request')
  return r.json()
}

export async function rejectShelterRequest(id: string, reason: string) {
  const r = await fetch(`/api/shelter/requests/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  })
  if (!r.ok) throw new Error('Failed to reject request')
  return r.json()
}


export async function dischargeResident(id: string) {
  const r = await fetch(`/api/shelter/residents/${id}/discharge`, { method: 'POST' })
  if (!r.ok) throw new Error('Failed to discharge resident')
  return r.json()
}
