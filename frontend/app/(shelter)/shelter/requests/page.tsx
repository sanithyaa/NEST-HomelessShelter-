'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useShelterGuard } from '@/lib/shelterGuard'
import { RequestList } from '@/components/Shelter/requests/RequestList'

export default function ShelterRequestsPage() {
  const session = useShelterGuard()
  const shelterId = session?.shelterId

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-brown dark:text-dark-muted">
        <span>Requests</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-deepbrown dark:text-dark-text font-medium">
          Pending Requests
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-deepbrown dark:text-dark-text">
          Admission Requests
        </h1>
        <p className="text-brown dark:text-dark-muted mt-1">
          Review and manage NGO referrals for shelter admission
        </p>
      </div>

      {/* Request List */}
      {shelterId && <RequestList shelterId={shelterId} />}
    </motion.div>
  )
}
