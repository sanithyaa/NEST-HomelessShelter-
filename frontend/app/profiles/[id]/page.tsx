'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { 
  User, 
  MapPin, 
  Heart, 
  Briefcase, 
  ClipboardList, 
  Calendar,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'
import { AIRecommendations } from '@/components/AIRecommendations'

interface ProfileData {
  id: string
  name: string
  alias?: string
  age: number
  gender: string
  location?: { lat: number; lng: number }
  locationName?: string
  health?: string
  disabilities?: string
  skills?: string
  workHistory?: string
  needs: string
  priority: string
  status?: string
  current_shelter?: string
  current_job?: string
  status_updated_at?: string
  createdAt: string
}

export default function ProfileViewPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [locationName, setLocationName] = useState<string>('')
  const [loadingLocation, setLoadingLocation] = useState(false)

  const loadProfile = async () => {
    try {
      const { getProfile } = await import('@/lib/api')
      const data = await getProfile(parseInt(profileId))
      
      // Transform backend data to match frontend expectations
      const transformedProfile: ProfileData = {
        id: data.profile_id?.toString() || '0',
        name: data.name || 'Unknown',
        alias: data.alias || undefined,
        age: data.age || 0,
        gender: data.gender || 'Unknown',
        location: data.geo_lat && data.geo_lng ? { lat: data.geo_lat, lng: data.geo_lng } : undefined,
        locationName: typeof data.location === 'string' ? data.location : undefined,
        health: data.health_status || undefined,
        disabilities: data.disabilities || undefined,
        skills: data.skills || undefined,
        workHistory: data.workHistory || undefined,
        needs: data.needs || 'Not specified',
        priority: data.priority || 'Medium',
        status: data.status || 'active',
        current_shelter: data.current_shelter || undefined,
        current_job: data.current_job || undefined,
        status_updated_at: data.status_updated_at || undefined,
        createdAt: data.createdAt || new Date().toISOString(),
      }
      
      setProfile(transformedProfile)
      
      // Use saved location name or fetch it
      if (transformedProfile.locationName) {
        setLocationName(transformedProfile.locationName)
      } else if (transformedProfile.location) {
        fetchLocationName(transformedProfile.location.lat, transformedProfile.location.lng)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [profileId])

  const fetchLocationName = async (lat: number, lng: number) => {
    setLoadingLocation(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      )
      const data = await response.json()
      
      if (data.display_name) {
        setLocationName(data.display_name)
      } else if (data.address) {
        // Build a readable address from components
        const parts = []
        if (data.address.road) parts.push(data.address.road)
        if (data.address.suburb) parts.push(data.address.suburb)
        if (data.address.city) parts.push(data.address.city)
        if (data.address.state) parts.push(data.address.state)
        if (data.address.country) parts.push(data.address.country)
        setLocationName(parts.join(', ') || 'Location found')
      }
    } catch (error) {
      console.error('Error fetching location name:', error)
      setLocationName('Unable to fetch location name')
    } finally {
      setLoadingLocation(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber mx-auto mb-4"></div>
          <p className="text-brown dark:text-dark-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <AlertCircle className="w-16 h-16 text-amber mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text mb-2">
            Profile Not Found
          </h2>
          <p className="text-brown dark:text-dark-muted mb-6">
            The profile with ID <span className="font-mono font-bold">{profileId}</span> could not be found.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-500 bg-red-100 dark:bg-red-900/20'
      case 'High': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20'
      case 'Medium': return 'text-amber bg-amber/20'
      case 'Low': return 'text-green-500 bg-green-100 dark:bg-green-900/20'
      default: return 'text-brown bg-tan'
    }
  }

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400'
      case 'shelter_requested': return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400'
      case 'job_requested': return 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-400'
      case 'both_requested': return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-400'
      case 'shelter_assigned': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400'
      case 'job_assigned': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400'
      case 'completed': return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400'
      case 'inactive': return 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-400'
      default: return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return '🔍'
      case 'shelter_requested': return '🏠'
      case 'job_requested': return '💼'
      case 'both_requested': return '🏠💼'
      case 'shelter_assigned': return '✅🏠'
      case 'job_assigned': return '✅💼'
      case 'completed': return '🎉'
      case 'inactive': return '⏸️'
      default: return '🔍'
    }
  }

  const getStatusTitle = (status?: string) => {
    switch (status) {
      case 'active': return 'Seeking Assistance'
      case 'shelter_requested': return 'Shelter Request Sent'
      case 'job_requested': return 'Job Request Sent'
      case 'both_requested': return 'Multiple Requests Sent'
      case 'shelter_assigned': return 'Shelter Assigned'
      case 'job_assigned': return 'Job Assigned'
      case 'completed': return 'Successfully Assisted'
      case 'inactive': return 'Inactive'
      default: return 'Seeking Assistance'
    }
  }

  const getStatusDescription = (status?: string, shelter?: string, job?: string) => {
    switch (status) {
      case 'active': return 'This person is actively looking for assistance with housing and employment.'
      case 'shelter_requested': return `Request sent to ${shelter} shelter on behalf of this person.`
      case 'job_requested': return `Request sent to ${job} organization for job placement.`
      case 'both_requested': return `Requests sent to ${shelter} shelter and ${job} organization.`
      case 'shelter_assigned': return `Successfully placed in ${shelter} shelter.`
      case 'job_assigned': return `Successfully employed at ${job}.`
      case 'completed': return 'This person has been successfully housed and employed.'
      case 'inactive': return 'This person is no longer actively seeking assistance.'
      default: return 'Status information not available.'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.back()}
          className="btn-secondary flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-deepbrown dark:text-dark-text mb-2">
              {profile.name}
            </h1>
            <p className="text-brown dark:text-dark-muted">
              Profile ID: <span className="font-mono font-bold">{profileId}</span>
            </p>
          </div>
          <span className={`px-4 py-2 rounded-xl font-semibold ${getPriorityColor(profile.priority)}`}>
            {profile.priority} Priority
          </span>
        </div>
      </motion.div>

      {/* Profile Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`p-4 rounded-xl border ${getStatusBadgeStyle(profile.status)}`}>
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            {getStatusIcon(profile.status)} {getStatusTitle(profile.status)}
          </h3>
          <p className="text-sm">
            {getStatusDescription(profile.status, profile.current_shelter, profile.current_job)}
          </p>
          {profile.status_updated_at && (
            <p className="text-xs mt-2 opacity-75">
              Last updated: {new Date(profile.status_updated_at).toLocaleString()}
            </p>
          )}
        </div>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AIRecommendations 
          profileId={parseInt(profileId)} 
          onAssignmentMade={loadProfile}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-amber" />
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-brown dark:text-dark-muted mb-1">Full Name</p>
              <p className="font-semibold text-deepbrown dark:text-dark-text text-lg">
                {profile.name}
              </p>
            </div>
            {profile.alias && (
              <div>
                <p className="text-sm text-brown dark:text-dark-muted mb-1">Also Known As</p>
                <p className="font-semibold text-deepbrown dark:text-dark-text">
                  {profile.alias}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-brown dark:text-dark-muted mb-1">Age</p>
              <p className="font-semibold text-deepbrown dark:text-dark-text">
                {profile.age} years old
              </p>
            </div>
            <div>
              <p className="text-sm text-brown dark:text-dark-muted mb-1">Gender</p>
              <p className="font-semibold text-deepbrown dark:text-dark-text">
                {profile.gender}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {profile.location && (
              <div>
                <p className="text-sm text-brown dark:text-dark-muted mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </p>
                {loadingLocation ? (
                  <p className="text-sm text-brown dark:text-dark-muted italic">
                    Loading location name...
                  </p>
                ) : locationName ? (
                  <p className="text-deepbrown dark:text-dark-text mb-2">
                    {locationName}
                  </p>
                ) : null}
                <p className="font-mono text-xs text-brown dark:text-dark-muted mb-2">
                  {profile.location.lat.toFixed(6)}, {profile.location.lng.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${profile.location.lat},${profile.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber hover:text-brown text-sm underline inline-flex items-center gap-1"
                >
                  View on Google Maps →
                </a>
              </div>
            )}
            <div>
              <p className="text-sm text-brown dark:text-dark-muted mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created
              </p>
              <p className="text-sm text-deepbrown dark:text-dark-text">
                {new Date(profile.createdAt).toLocaleDateString()} at{' '}
                {new Date(profile.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {(profile.health || profile.disabilities) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-amber" />
            Health Information
          </h2>
          <div className="space-y-4">
            {profile.health && (
              <div>
                <p className="text-sm text-brown dark:text-dark-muted mb-2">Health Conditions</p>
                <p className="text-deepbrown dark:text-dark-text whitespace-pre-wrap">
                  {profile.health}
                </p>
              </div>
            )}
            {profile.disabilities && (
              <div>
                <p className="text-sm text-brown dark:text-dark-muted mb-2">Disabilities / Special Needs</p>
                <p className="text-deepbrown dark:text-dark-text whitespace-pre-wrap">
                  {profile.disabilities}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {(profile.skills || profile.workHistory) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber" />
            Skills & Work History
          </h2>
          <div className="space-y-4">
            {profile.skills && (
              <div>
                <p className="text-sm text-brown dark:text-dark-muted mb-2">Skills & Abilities</p>
                <p className="text-deepbrown dark:text-dark-text whitespace-pre-wrap">
                  {profile.skills}
                </p>
              </div>
            )}
            {profile.workHistory && (
              <div>
                <p className="text-sm text-brown dark:text-dark-muted mb-2">Previous Work Experience</p>
                <p className="text-deepbrown dark:text-dark-text whitespace-pre-wrap">
                  {profile.workHistory}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card border-l-4 border-amber"
      >
        <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-amber" />
          Immediate Needs
        </h2>
        <p className="text-deepbrown dark:text-dark-text whitespace-pre-wrap mb-4">
          {profile.needs}
        </p>
        <div className="bg-tan dark:bg-dark-surface p-4 rounded-xl">
          <p className="text-sm text-brown dark:text-dark-muted">
            <strong>Priority Level:</strong>{' '}
            <span className={`font-bold ${getPriorityColor(profile.priority).split(' ')[0]}`}>
              {profile.priority}
            </span>
          </p>
        </div>
      </motion.div>


    </div>
  )
}
