'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  MapPin,
  Calendar,
  AlertCircle,
  Eye
} from 'lucide-react'

interface ProfileData {
  id: string
  name: string
  alias?: string
  age: number
  gender: string
  location?: { lat: number; lng: number }
  locationName?: string
  needs: string
  priority: string
  createdAt: string
}

export default function AllProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  useEffect(() => {
    // Load profiles from backend API
    const loadProfiles = async () => {
      try {
        const { getProfiles } = await import('@/lib/api')
        const data = await getProfiles()
        // Transform backend data to match frontend expectations
        const transformedProfiles = data.map(p => ({
          id: p.profile_id.toString(),
          name: p.name,
          alias: p.alias,
          age: p.age,
          gender: p.gender,
          location: p.geo_lat && p.geo_lng ? { lat: p.geo_lat, lng: p.geo_lng } : undefined,
          locationName: p.location,
          needs: p.needs || 'Not specified',
          priority: p.priority || 'Medium',
          createdAt: p.createdAt,
        }))
        setProfiles(transformedProfiles)
      } catch (error) {
        console.error('Error loading profiles:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProfiles()
  }, [])

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = 
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriority = 
      filterPriority === 'all' || profile.priority === filterPriority

    return matchesSearch && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      case 'High': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      case 'Medium': return 'bg-amber/20 text-amber dark:bg-amber/10'
      case 'Low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-tan text-brown'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber mx-auto mb-4"></div>
          <p className="text-brown dark:text-dark-muted">Loading profiles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-deepbrown dark:text-dark-text mb-2">
            All Profiles
          </h1>
          <p className="text-brown dark:text-dark-muted">
            {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/profiles/create'}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Profile
        </button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
            <input
              type="text"
              placeholder="Search by name, alias, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="input pl-10 pr-8"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Profiles List */}
      {filteredProfiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center py-12"
        >
          <AlertCircle className="w-16 h-16 text-brown dark:text-dark-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-2">
            No Profiles Found
          </h3>
          <p className="text-brown dark:text-dark-muted mb-6">
            {profiles.length === 0
              ? "You haven't created any profiles yet."
              : 'No profiles match your search criteria.'}
          </p>
          {profiles.length === 0 && (
            <button
              onClick={() => window.location.href = '/profiles/create'}
              className="btn-primary"
            >
              Create Your First Profile
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="card hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              onClick={() => window.location.href = `/profiles/${profile.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber" />
                  </div>
                  <div>
                    <h3 className="font-bold text-deepbrown dark:text-dark-text group-hover:text-amber transition-colors">
                      {profile.name}
                    </h3>
                    {profile.alias && (
                      <p className="text-xs text-brown dark:text-dark-muted">
                        aka {profile.alias}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(profile.priority)}`}>
                  {profile.priority}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-brown dark:text-dark-muted">
                  <Users className="w-4 h-4" />
                  <span>{profile.age} years • {profile.gender}</span>
                </div>
                {profile.locationName && (
                  <div className="flex items-start gap-2 text-brown dark:text-dark-muted">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{profile.locationName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-brown dark:text-dark-muted">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-beige dark:border-dark-border">
                <p className="text-sm text-brown dark:text-dark-muted line-clamp-2 mb-3">
                  <strong>Needs:</strong> {profile.needs}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = `/profiles/${profile.id}`
                  }}
                  className="w-full btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>

              <div className="mt-3 text-xs text-brown/50 dark:text-dark-muted font-mono">
                ID: {profile.id}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
