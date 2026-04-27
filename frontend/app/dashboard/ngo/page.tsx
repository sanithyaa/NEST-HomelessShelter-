'use client'

import { useQuery } from '@tanstack/react-query'
import { StatsCard } from '@/components/StatsCard'
import { RecentActivity } from '@/components/RecentActivity'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Building2, Briefcase, Users, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function NGODashboard() {
  const { t } = useTranslation()
  
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return {
        shelters: 9,
        jobs: 15,
        volunteers: 12,
        successRate: 78,
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
          NGO Dashboard 🏠
        </h1>
        <p className="text-brown dark:text-dark-muted">
          Manage your resources and make an impact
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Total Shelters"
          value={data?.shelters || 0}
          icon={Building2}
          color="text-amber"
          delay={0.1}
        />
        <StatsCard
          title="Job Placements"
          value={data?.jobs || 0}
          icon={Briefcase}
          color="text-brown"
          delay={0.2}
        />
        <StatsCard
          title="Active Volunteers"
          value={data?.volunteers || 0}
          icon={Users}
          color="text-earthy"
          delay={0.3}
        />
        <StatsCard
          title="Success Rate"
          value={`${data?.successRate || 0}%`}
          icon={TrendingUp}
          color="text-green-500"
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
          Resource Management
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/resources/shelters"
            className="btn-primary flex items-center gap-2"
          >
            🏠 Manage Shelters
          </Link>
          <Link
            href="/resources/jobs"
            className="btn-secondary flex items-center gap-2"
          >
            💼 Manage Jobs
          </Link>
          <Link
            href="/reports"
            className="bg-tan dark:bg-dark-surface text-deepbrown dark:text-dark-text px-6 py-3 rounded-2xl font-medium hover:bg-beige dark:hover:bg-dark-card transition-all duration-300 flex items-center gap-2"
          >
            📊 View Reports
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card"
      >
        <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-3">
          Impact Summary
        </h2>
        <p className="text-brown dark:text-dark-muted mb-4">
          Your organization has helped connect {data?.volunteers || 0} volunteers with resources, 
          providing shelter to dozens and creating {data?.jobs || 0} job opportunities.
        </p>
        <div className="bg-tan dark:bg-dark-surface p-4 rounded-xl">
          <p className="text-sm text-brown dark:text-dark-muted">
            💡 <strong>Tip:</strong> Keep your shelter and job listings updated to maximize impact.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <RecentActivity />
      </motion.div>
    </div>
  )
}
