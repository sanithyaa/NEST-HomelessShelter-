'use client'

import { useQuery } from '@tanstack/react-query'
import { StatsCard } from '@/components/StatsCard'
import { RecentActivity } from '@/components/RecentActivity'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, Building2, Briefcase, Heart, UserCheck, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function AdminDashboard() {
  const { t } = useTranslation()
  
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return {
        totalProfiles: 42,
        shelters: 9,
        jobs: 15,
        matches: 23,
        volunteers: 12,
        ngos: 5,
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
          Admin Overview 🛡️
        </h1>
        <p className="text-brown dark:text-dark-muted">
          Complete system management and analytics
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatsCard
          title="Total Profiles"
          value={data?.totalProfiles || 0}
          icon={Users}
          color="text-amber"
          delay={0.1}
        />
        <StatsCard
          title="Shelters"
          value={data?.shelters || 0}
          icon={Building2}
          color="text-brown"
          delay={0.2}
        />
        <StatsCard
          title="Job Listings"
          value={data?.jobs || 0}
          icon={Briefcase}
          color="text-earthy"
          delay={0.3}
        />
        <StatsCard
          title="Matches"
          value={data?.matches || 0}
          icon={Heart}
          color="text-pink-500"
          delay={0.4}
        />
        <StatsCard
          title="Admin"
          value={data?.volunteers || 0}
          icon={UserCheck}
          color="text-green-500"
          delay={0.5}
        />
        <StatsCard
          title="NGO Partners"
          value={data?.ngos || 0}
          icon={TrendingUp}
          color="text-blue-500"
          delay={0.6}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="card"
      >
        <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text mb-4">
          System Management
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link
            href="/profiles/all"
            className="btn-primary flex items-center justify-center gap-2"
          >
            👥 Manage Profiles
          </Link>
          <Link
            href="/resources/shelters"
            className="bg-beige dark:bg-dark-surface text-deepbrown dark:text-dark-text px-6 py-3 rounded-2xl font-medium hover:bg-tan dark:hover:bg-dark-card transition-all duration-300 flex items-center justify-center gap-2"
          >
            🏠 Manage Shelters
          </Link>
          <Link
            href="/resources/jobs"
            className="bg-tan dark:bg-dark-surface text-deepbrown dark:text-dark-text px-6 py-3 rounded-2xl font-medium hover:bg-beige dark:hover:bg-dark-card transition-all duration-300 flex items-center justify-center gap-2"
          >
            💼 Manage Jobs
          </Link>
          <Link
            href="/matches"
            className="btn-secondary flex items-center justify-center gap-2"
          >
            ✅ Successful Placements
          </Link>
          <Link
            href="/settings"
            className="bg-brown dark:bg-dark-card text-white dark:text-dark-text px-6 py-3 rounded-2xl font-medium hover:bg-deepbrown dark:hover:bg-dark-border transition-all duration-300 flex items-center justify-center gap-2"
          >
            ⚙️ Settings
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="card"
        >
          <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-3">
            System Health
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-brown dark:text-dark-muted">Database</span>
              <span className="text-green-500 font-semibold">✓ Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brown dark:text-dark-muted">API Status</span>
              <span className="text-green-500 font-semibold">✓ Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brown dark:text-dark-muted">Storage</span>
              <span className="text-amber font-semibold">⚠ 78% Used</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <RecentActivity />
        </motion.div>
      </div>
    </div>
  )
}
