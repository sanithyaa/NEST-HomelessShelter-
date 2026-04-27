'use client'

import { motion } from 'framer-motion'
import { User, MapPin, Heart, Briefcase, FileText, Calendar, Home } from 'lucide-react'
import { format } from 'date-fns'
import type { ShelterResident } from '@/lib/types'

interface OverviewPlaceholderProps {
  resident: ShelterResident
}

export function OverviewPlaceholder({ resident }: OverviewPlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      role="tabpanel"
      id="overview-panel"
      className="space-y-6"
    >
      {/* Personal Information */}
      <div className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-amber" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-brown dark:text-dark-muted">Full Name</p>
            <p className="text-deepbrown dark:text-dark-text font-medium">{resident.name}</p>
          </div>
          {resident.alias && (
            <div>
              <p className="text-sm text-brown dark:text-dark-muted">Alias</p>
              <p className="text-deepbrown dark:text-dark-text font-medium">{resident.alias}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-brown dark:text-dark-muted">Age</p>
            <p className="text-deepbrown dark:text-dark-text font-medium">{resident.age} years</p>
          </div>
          <div>
            <p className="text-sm text-brown dark:text-dark-muted">Gender</p>
            <p className="text-deepbrown dark:text-dark-text font-medium">{resident.gender}</p>
          </div>
        </div>
      </div>

      {/* Shelter Information */}
      <div className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-amber" />
          Shelter Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resident.bed_number && (
            <div>
              <p className="text-sm text-brown dark:text-dark-muted">Bed Number</p>
              <p className="text-deepbrown dark:text-dark-text font-medium">{resident.bed_number}</p>
            </div>
          )}
          {resident.room_number && (
            <div>
              <p className="text-sm text-brown dark:text-dark-muted">Room Number</p>
              <p className="text-deepbrown dark:text-dark-text font-medium">{resident.room_number}</p>
            </div>
          )}
          {(resident.admission_date || resident.admittedAt) && (
            <div>
              <p className="text-sm text-brown dark:text-dark-muted">Admission Date</p>
              <p className="text-deepbrown dark:text-dark-text font-medium">
                {format(new Date(resident.admission_date || resident.admittedAt || ''), 'PPP')}
              </p>
            </div>
          )}
          {resident.source && (
            <div>
              <p className="text-sm text-brown dark:text-dark-muted">Source</p>
              <p className="text-deepbrown dark:text-dark-text font-medium capitalize">{resident.source.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Health Information */}
      {resident.health_status && (
        <div className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber" />
            Health Status
          </h3>
          <p className="text-deepbrown dark:text-dark-text">{resident.health_status}</p>
          {resident.disabilities && (
            <div className="mt-3">
              <p className="text-sm text-brown dark:text-dark-muted mb-1">Disabilities</p>
              <p className="text-deepbrown dark:text-dark-text">{resident.disabilities}</p>
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      {resident.skills && (
        <div className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber" />
            Skills & Experience
          </h3>
          <p className="text-deepbrown dark:text-dark-text">{resident.skills}</p>
        </div>
      )}

      {/* Emergency Contact */}
      {(resident.emergency_contact || resident.emergency_phone) && (
        <div className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-amber" />
            Emergency Contact
          </h3>
          <div className="space-y-2">
            {resident.emergency_contact && (
              <div>
                <p className="text-sm text-brown dark:text-dark-muted">Name</p>
                <p className="text-deepbrown dark:text-dark-text font-medium">{resident.emergency_contact}</p>
              </div>
            )}
            {resident.emergency_phone && (
              <div>
                <p className="text-sm text-brown dark:text-dark-muted">Phone</p>
                <p className="text-deepbrown dark:text-dark-text font-medium">{resident.emergency_phone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {resident.notes && (
        <div className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber" />
            Notes
          </h3>
          <p className="text-deepbrown dark:text-dark-text whitespace-pre-wrap">{resident.notes}</p>
        </div>
      )}
    </motion.div>
  )
}
