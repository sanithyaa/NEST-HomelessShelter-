'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bed } from 'lucide-react'
import { fetchShelterBedStats } from '@/lib/api'
import type { BedStats } from '@/lib/types'

export function BedOccupancyCard({ shelterId }: { shelterId?: string }) {
  const { data: stats, isLoading } = useQuery<BedStats>({
    queryKey: ['shelter-bed-stats', shelterId],
    queryFn: () => fetchShelterBedStats(shelterId!),
    enabled: !!shelterId,
    staleTime: 0, // Always refetch
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const occupancyPercentage = stats
    ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100)
    : 0

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
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-deepbrown dark:text-dark-text">
          Bed Occupancy
        </h3>
        <Bed className="w-6 h-6 text-amber" />
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-deepbrown dark:text-dark-text">
            {stats?.occupiedBeds}
          </span>
          <span className="text-lg text-brown dark:text-dark-muted">
            / {stats?.totalBeds}
          </span>
        </div>

        <div className="space-y-2">
          <div className="w-full bg-tan dark:bg-dark-card rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupancyPercentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="bg-amber h-2.5 rounded-full"
            />
          </div>
          <p className="text-xs text-brown dark:text-dark-muted">
            {occupancyPercentage}% Occupied • {stats?.availableBeds} Available
          </p>
        </div>
      </div>
    </motion.div>
  )
}
