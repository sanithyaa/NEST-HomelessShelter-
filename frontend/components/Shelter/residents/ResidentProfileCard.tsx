'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Calendar, Bed, LogOut } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { DischargeModal } from './DischargeModal'

interface ResidentProfileCardProps {
  resident: {
    id: string
    name: string
    age?: number
    gender?: string
    bedNumber?: string | null
    admittedAt: string
    photoUrl?: string | null
  }
}

export function ResidentProfileCard({ resident }: ResidentProfileCardProps) {
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg mb-6"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            {resident.photoUrl ? (
              <img
                src={resident.photoUrl}
                alt={resident.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-dark-border shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brown flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {resident.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-deepbrown dark:text-dark-text">
                {resident.name}
              </h1>
              <button
                onClick={() => setIsDischargeModalOpen(true)}
                className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium flex items-center gap-2 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Discharge
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Age & Gender */}
            {(resident.age || resident.gender) && (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber" />
                <div>
                  <p className="text-xs text-brown dark:text-dark-muted">Demographics</p>
                  <p className="text-sm font-medium text-deepbrown dark:text-dark-text">
                    {resident.gender}
                    {resident.age && `, ${resident.age} years`}
                  </p>
                </div>
              </div>
            )}

            {/* Bed Number */}
            {resident.bedNumber && (
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-amber" />
                <div>
                  <p className="text-xs text-brown dark:text-dark-muted">Bed Assignment</p>
                  <p className="text-sm font-medium text-deepbrown dark:text-dark-text">
                    {resident.bedNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Admitted Date */}
            {(resident.admission_date || resident.admittedAt) && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber" />
                <div>
                  <p className="text-xs text-brown dark:text-dark-muted">Admitted</p>
                  <p className="text-sm font-medium text-deepbrown dark:text-dark-text">
                    {formatDistanceToNow(new Date(resident.admission_date || resident.admittedAt || ''), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>

      <DischargeModal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        resident={resident}
      />
    </>
  )
}
