'use client'

import { motion } from 'framer-motion'
import { useShelterGuard } from '@/lib/shelterGuard'
import { BedOccupancyCard } from '@/components/Shelter/dashboard/BedOccupancyCard'
import { PendingRequestsCard } from '@/components/Shelter/dashboard/PendingRequestsCard'
import { RecentAdmissions } from '@/components/Shelter/dashboard/RecentAdmissions'
import { UpcomingDischarges } from '@/components/Shelter/dashboard/UpcomingDischarges'

export default function ShelterDashboard() {
  const session = useShelterGuard()
  const shelterId = session?.shelterId

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-deepbrown dark:text-dark-text">
          Shelter Dashboard
        </h1>
        <p className="text-brown dark:text-dark-muted mt-1">
          Overview of your shelter's activity and residents
        </p>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <BedOccupancyCard shelterId={shelterId} />
        <PendingRequestsCard shelterId={shelterId} />
        <RecentAdmissions shelterId={shelterId} />
        <UpcomingDischarges shelterId={shelterId} />
      </div>
    </motion.div>
  )
}
