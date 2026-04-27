'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Stethoscope, Calendar, AlertCircle } from 'lucide-react'
import { fetchFollowupsByShelterId, fetchMedicalRecords, fetchShelterResidents } from '@/lib/api'
import { getShelterSession } from '@/lib/shelterAuth'
import { useShelterGuard } from '@/lib/shelterGuard'
import { FollowupCard } from '@/components/Shelter/medical/FollowupCard'
import { isToday, isFuture, isPast, parseISO } from 'date-fns'

export default function ShelterMedicalPage() {
  useShelterGuard()
  const session = getShelterSession()

  const { data: followups, isLoading } = useQuery({
    queryKey: ['followups', session?.shelterId],
    queryFn: () => fetchFollowupsByShelterId(session?.shelterId || 'S001'),
    enabled: !!session?.shelterId,
  })

  const { data: records } = useQuery({
    queryKey: ['medical-records'],
    queryFn: () => fetchMedicalRecords(),
  })

  const { data: residents } = useQuery({
    queryKey: ['shelter-residents', session?.shelterId],
    queryFn: () => fetchShelterResidents(session?.shelterId || 'S001'),
  })

  // Categorize followups
  const todayFollowups = followups?.filter((f: any) => {
    const date = parseISO(f.date)
    return isToday(date) && !f.completed
  }) || []

  const upcomingFollowups = followups?.filter((f: any) => {
    const date = parseISO(f.date)
    return isFuture(date) && !isToday(date) && !f.completed
  }) || []

  const overdueFollowups = followups?.filter((f: any) => {
    const date = parseISO(f.date)
    return isPast(date) && !isToday(date) && !f.completed
  }) || []

  // Helper to get diagnosis for a followup
  const getDiagnosis = (recordId: string) => {
    const record = records?.find((r: any) => r.id === recordId)
    return record?.diagnosis
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-tan dark:bg-dark-card rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-beige dark:bg-dark-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
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
        <h1 className="text-3xl font-bold text-deepbrown dark:text-dark-text flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-red-600" />
          Medical Follow-Ups
        </h1>
        <p className="text-brown dark:text-dark-muted mt-1">
          Track and manage scheduled medical appointments
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-deepbrown dark:text-dark-text">
                {todayFollowups.length}
              </p>
              <p className="text-sm text-brown dark:text-dark-muted">Today</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-deepbrown dark:text-dark-text">
                {upcomingFollowups.length}
              </p>
              <p className="text-sm text-brown dark:text-dark-muted">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-2xl font-bold text-deepbrown dark:text-dark-text">
                {overdueFollowups.length}
              </p>
              <p className="text-sm text-brown dark:text-dark-muted">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Follow-Ups */}
        <div className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-tan dark:border-dark-border">
          <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Today's Follow-Ups
          </h2>
          
          {todayFollowups.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-tan dark:text-dark-border mx-auto mb-3" />
              <p className="text-brown dark:text-dark-muted text-sm">
                No follow-ups scheduled for today
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayFollowups.map((followup: any) => (
                <FollowupCard
                  key={followup.id}
                  followup={followup}
                  diagnosis={getDiagnosis(followup.recordId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Follow-Ups */}
        <div className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-tan dark:border-dark-border">
          <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Upcoming
          </h2>
          
          {upcomingFollowups.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-tan dark:text-dark-border mx-auto mb-3" />
              <p className="text-brown dark:text-dark-muted text-sm">
                No upcoming follow-ups
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingFollowups.map((followup: any) => (
                <FollowupCard
                  key={followup.id}
                  followup={followup}
                  diagnosis={getDiagnosis(followup.recordId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Overdue Follow-Ups */}
        <div className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-tan dark:border-dark-border">
          <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Overdue
          </h2>
          
          {overdueFollowups.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-tan dark:text-dark-border mx-auto mb-3" />
              <p className="text-brown dark:text-dark-muted text-sm">
                No overdue follow-ups
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueFollowups.map((followup: any) => (
                <FollowupCard
                  key={followup.id}
                  followup={followup}
                  diagnosis={getDiagnosis(followup.recordId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
