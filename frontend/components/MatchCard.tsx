'use client'

import { motion } from 'framer-motion'
import { Building2, Briefcase, User, Calendar, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Recommendation {
  id: string
  type: 'Shelter' | 'Job'
  name: string
  score: number
  reason: string
}

interface MatchCardProps {
  match: {
    id: number
    profileId: number
    profileName: string
    priority: string
    recommendations: Recommendation[]
  }
}

const priorityColors = {
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-tan dark:border-dark-border"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center text-white font-bold text-lg">
            {match.profileName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-deepbrown dark:text-dark-text">
              {match.profileName}
            </h3>
            <p className="text-sm text-brown dark:text-dark-muted">Profile ID: {match.profileId}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            priorityColors[match.priority as keyof typeof priorityColors] || priorityColors.Medium
          }`}
        >
          {match.priority}
        </span>
      </div>

      {/* Placements */}
      <div className="space-y-3">
        {match.recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white dark:bg-dark-card rounded-xl p-4 border border-tan dark:border-dark-border"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                {rec.type === 'Shelter' ? (
                  <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-deepbrown dark:text-dark-text">{rec.name}</h4>
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-brown dark:text-dark-muted">{rec.type} Placement</p>
                <p className="text-xs text-brown dark:text-dark-muted mt-1">{rec.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Profile Link */}
      <Link
        href={`/profiles/${match.profileId}`}
        className="mt-4 w-full px-4 py-2 bg-amber hover:bg-brown text-white rounded-xl transition-colors text-center font-medium flex items-center justify-center gap-2"
      >
        <User className="w-4 h-4" />
        View Full Profile
      </Link>
    </motion.div>
  )
}
