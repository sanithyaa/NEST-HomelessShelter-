'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { fetchRecentAdmissions } from '@/lib/api'
import type { AdmissionItem } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

export function RecentAdmissions({ shelterId }: { shelterId?: string }) {
  const { data: admissions, isLoading } = useQuery<AdmissionItem[]>({
    queryKey: ['shelter-recent-admissions', shelterId],
    queryFn: () => fetchRecentAdmissions(shelterId!),
    enabled: !!shelterId,
  })

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-tan dark:bg-dark-card rounded w-3/4 mb-4" />
        <div className="h-8 bg-tan dark:bg-dark-card rounded w-1/2" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-deepbrown dark:text-dark-text">
          Recent Admissions
        </h3>
        <UserPlus className="w-6 h-6 text-green-500" />
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {admissions && admissions.length > 0 ? (
          admissions.map((admission, index) => (
            <motion.div
              key={admission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between text-sm bg-white dark:bg-dark-card p-2 rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-deepbrown dark:text-dark-text font-medium truncate">
                  {admission.residentName}
                </span>
              </div>
              <span className="text-xs text-brown dark:text-dark-muted ml-2 flex-shrink-0">
                {formatDistanceToNow(new Date(admission.admittedAt), { addSuffix: true })}
              </span>
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-brown dark:text-dark-muted italic">
            No recent admissions
          </p>
        )}
      </div>
    </motion.div>
  )
}
