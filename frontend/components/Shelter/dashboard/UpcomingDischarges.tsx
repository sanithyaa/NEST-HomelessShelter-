'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CalendarClock } from 'lucide-react'
import { fetchUpcomingDischarges } from '@/lib/api'
import type { DischargeItem } from '@/lib/types'
import { format, formatDistanceToNow } from 'date-fns'

export function UpcomingDischarges({ shelterId }: { shelterId?: string }) {
  const { data: discharges, isLoading } = useQuery<DischargeItem[]>({
    queryKey: ['shelter-upcoming-discharges', shelterId],
    queryFn: () => fetchUpcomingDischarges(shelterId!),
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
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-deepbrown dark:text-dark-text">
          Upcoming Discharges
        </h3>
        <CalendarClock className="w-6 h-6 text-blue-500" />
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {discharges && discharges.length > 0 ? (
          discharges.map((discharge, index) => (
            <motion.div
              key={discharge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between text-sm bg-white dark:bg-dark-card p-2 rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-deepbrown dark:text-dark-text font-medium truncate">
                  {discharge.residentName}
                </span>
              </div>
              <div className="text-xs text-brown dark:text-dark-muted ml-2 flex-shrink-0 text-right">
                <div>{format(new Date(discharge.dischargeDate), 'MMM d')}</div>
                <div className="text-[10px]">
                  {formatDistanceToNow(new Date(discharge.dischargeDate), { addSuffix: true })}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-brown dark:text-dark-muted italic">
            No upcoming discharges
          </p>
        )}
      </div>
    </motion.div>
  )
}
