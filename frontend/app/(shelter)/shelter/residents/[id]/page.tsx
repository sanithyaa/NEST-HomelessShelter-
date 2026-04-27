'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useShelterGuard } from '@/lib/shelterGuard'
import { getResidentDetails } from '@/lib/shelterApi'
import { ResidentProfileCard } from '@/components/Shelter/residents/ResidentProfileCard'
import { TabsContainer } from '@/components/Shelter/residents/ResidentTabs/TabsContainer'
import { OverviewPlaceholder } from '@/components/Shelter/residents/ResidentTabs/OverviewPlaceholder'
import { MedicalTab } from '@/components/Shelter/residents/ResidentTabs/MedicalTab'
import { DailyLogsTab } from '@/components/Shelter/residents/ResidentTabs/DailyLogsTab'
import { DischargeTab } from '@/components/Shelter/residents/ResidentTabs/DischargeTab'

export default function ResidentDetailPage() {
  useShelterGuard()
  const params = useParams()
  const residentId = params.id as string
  const [activeTab, setActiveTab] = useState('overview')

  const { data: resident, isLoading } = useQuery({
    queryKey: ['shelter-resident', residentId],
    queryFn: () => getResidentDetails(parseInt(residentId)),
    enabled: !!residentId,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg animate-pulse">
          <div className="flex gap-6">
            <div className="w-24 h-24 rounded-full bg-tan dark:bg-dark-card" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-tan dark:bg-dark-card rounded w-1/3" />
              <div className="h-4 bg-tan dark:bg-dark-card rounded w-1/2" />
            </div>
          </div>
        </div>
        <div className="h-16 bg-tan dark:bg-dark-card rounded-xl animate-pulse" />
        <div className="h-64 bg-beige dark:bg-dark-surface rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!resident) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-beige dark:bg-dark-surface rounded-2xl p-12 text-center shadow-lg"
      >
        <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text mb-2">
          Resident Not Found
        </h2>
        <p className="text-brown dark:text-dark-muted">
          The resident you're looking for doesn't exist or you don't have access.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-deepbrown dark:text-dark-text">
          {resident.name}
        </h1>
        <p className="text-brown dark:text-dark-muted mt-1">
          Resident details & history
        </p>
      </div>

      {/* Profile Card */}
      <ResidentProfileCard resident={resident} />

      {/* Tabs */}
      <TabsContainer activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && <OverviewPlaceholder key="overview" resident={resident} />}
        {activeTab === 'medical' && <MedicalTab key="medical" resident={resident} />}
        {activeTab === 'logs' && <DailyLogsTab key="logs" resident={resident} />}
        {activeTab === 'discharge' && <DischargeTab key="discharge" resident={resident} />}
      </AnimatePresence>
    </motion.div>
  )
}
