'use client'

import { motion } from 'framer-motion'
import { QRCodeCanvas } from 'qrcode.react'
import { User, MapPin, Calendar, Edit } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Profile } from '@/lib/api'

const MapPreview = dynamic(() => import('./MapPreview'), {
  ssr: false,
  loading: () => (
    <div className="h-[150px] bg-tan dark:bg-dark-surface rounded-xl flex items-center justify-center">
      <p className="text-sm text-brown dark:text-dark-muted">Loading map...</p>
    </div>
  ),
})

interface ProfileCardProps {
  profile: Profile
  onEdit?: () => void
  onAssignShelter?: () => void
}

export function ProfileCard({ profile, onEdit, onAssignShelter }: ProfileCardProps) {
  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/profiles/${profile.id}`
    : ''

  const maskedId = `****-${profile.id.slice(-4)}`

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="card space-y-4"
      data-testid="profile-card"
    >
      {/* Avatar and Basic Info */}
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-amber/20 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-10 h-10 text-amber" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text">
            {profile.name}
          </h2>
          {profile.alias && (
            <p className="text-brown dark:text-dark-muted">aka {profile.alias}</p>
          )}
          <p className="text-sm text-brown/70 dark:text-dark-muted font-mono mt-1">
            ID: {maskedId}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-tan dark:bg-dark-surface p-3 rounded-xl">
          <p className="text-brown dark:text-dark-muted mb-1">Age</p>
          <p className="font-semibold text-deepbrown dark:text-dark-text">
            {profile.age} years
          </p>
        </div>
        <div className="bg-tan dark:bg-dark-surface p-3 rounded-xl">
          <p className="text-brown dark:text-dark-muted mb-1">Gender</p>
          <p className="font-semibold text-deepbrown dark:text-dark-text">
            {profile.gender}
          </p>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-xl flex flex-col items-center">
        <QRCodeCanvas value={profileUrl} size={120} level="H" includeMargin />
        <p className="text-xs text-brown dark:text-dark-muted mt-2 text-center">
          Scan to view profile
        </p>
      </div>

      {/* Map Preview */}
      {profile.location && (
        <div>
          <p className="text-sm font-medium text-deepbrown dark:text-dark-text mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </p>
          <MapPreview
            lat={profile.location.lat}
            lng={profile.location.lng}
            locationName={profile.locationName}
          />
        </div>
      )}

      {/* Last Seen */}
      {profile.lastSeen && (
        <div className="flex items-center gap-2 text-sm text-brown dark:text-dark-muted">
          <Calendar className="w-4 h-4" />
          <span>Last seen: {new Date(profile.lastSeen).toLocaleDateString()}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-beige dark:border-dark-border">
        {onAssignShelter && (
          <button
            onClick={onAssignShelter}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            🏠 Assign Shelter
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Basic Info
          </button>
        )}
      </div>
    </motion.div>
  )
}
