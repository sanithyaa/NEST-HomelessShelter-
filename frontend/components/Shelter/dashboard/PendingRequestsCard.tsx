'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Inbox, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { fetchShelterPendingRequests } from '@/lib/api'
import type { PendingRequestSummary } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

export function PendingRequestsCard({ shelterId }: { shelterId?: string }) {
  const { data: requests, isLoading } = useQuery<PendingRequestSummary[]>({
    queryKey: ['shelter-pending-requests', shelterId],
    queryFn: () => fetchShelterPendingRequests(shelterId!),
    enabled: !!shelterId,
  })

  const priorityColors = {
    High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-tan dark:bg-dark-card rounded w-3/4 mb-4" />
        <div className="h-8 bg-tan dark:bg-dark-card rounded w-1/2" />
      </div>
    )
  }

  const topRequests = requests?.slice(0, 2) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-deepbrown dark:text-dark-text">
          Pending Requests
        </h3>
        <Inbox className="w-6 h-6 text-orange-500" />
      </div>

      <div className="text-3xl font-bold text-deepbrown dark:text-dark-text mb-4">
        {requests?.length || 0}
      </div>

      {topRequests.length > 0 ? (
        <div className="space-y-2 mb-4">
          {topRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between text-sm bg-white dark:bg-dark-card p-2 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-deepbrown dark:text-dark-text font-medium truncate">
                  {request.residentName}
                </p>
                <p className="text-xs text-brown dark:text-dark-muted">
                  {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${
                  priorityColors[request.priority]
                }`}
              >
                {request.priority}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-brown dark:text-dark-muted italic mb-4">
          No pending requests
        </p>
      )}

      <Link href="/shelter/requests">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brown hover:bg-deepbrown text-white rounded-lg transition-colors text-sm font-medium"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </Link>
    </motion.div>
  )
}
