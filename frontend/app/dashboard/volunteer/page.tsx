'use client'

import { useQuery } from '@tanstack/react-query'
import { StatsCard } from '@/components/StatsCard'
import { RecentActivity } from '@/components/RecentActivity'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, Clock, CheckCircle, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function VolunteerDashboard() {
  const { t } = useTranslation()
  
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return {
        totalProfiles: 42,
        pendingProfiles: 7,
        approvedProfiles: 35,
        matches: 23,
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber mx-auto mb-4"></div>
          <p className="text-brown dark:text-dark-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-deepbrown dark:text-dark-text mb-2">
          Welcome
        </h1>
        <p className="text-brown dark:text-dark-muted">
          Thank you for making a difference in people's lives
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Total Profiles"
          value={data?.totalProfiles || 0}
          icon={Users}
          color="text-amber"
          delay={0.1}
        />
        <StatsCard
          title="Pending Approvals"
          value={data?.pendingProfiles || 0}
          icon={Clock}
          color="text-brown"
          delay={0.2}
        />
        <StatsCard
          title="Approved"
          value={data?.approvedProfiles || 0}
          icon={CheckCircle}
          color="text-green-500"
          delay={0.3}
        />
        <StatsCard
          title="Matches"
          value={data?.matches || 0}
          icon={Heart}
          color="text-earthy"
          delay={0.4}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card"
      >
        <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/profiles/create"
            className="btn-primary flex items-center gap-2"
          >
            ➕ Create New Profile
          </a>
          <a
            href="/profiles/all"
            className="btn-secondary flex items-center gap-2"
          >
            📄 My Submissions
          </a>
          <a
            href="/matches"
            className="bg-tan dark:bg-dark-surface text-deepbrown dark:text-dark-text px-6 py-3 rounded-2xl font-medium hover:bg-beige dark:hover:bg-dark-card transition-all duration-300 flex items-center gap-2"
          >
            💝 View Matches
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <RecentActivity />
      </motion.div>
    </div>
  )
}
