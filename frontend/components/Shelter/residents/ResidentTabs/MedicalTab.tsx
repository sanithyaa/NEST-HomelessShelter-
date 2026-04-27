'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Stethoscope } from 'lucide-react'
import { fetchMedicalRecords, fetchFollowupsByShelterId } from '@/lib/api'
import { getShelterSession } from '@/lib/shelterAuth'
import { MedicalRecordCard } from '../medical/MedicalRecordCard'
import { AddMedicalRecordForm } from '../medical/AddMedicalRecordForm'

interface MedicalTabProps {
  resident: {
    id: string
    name: string
  }
}

export function MedicalTab({ resident }: MedicalTabProps) {
  const session = getShelterSession()
  
  const { data: records, isLoading } = useQuery({
    queryKey: ['medical-records', resident.id],
    queryFn: () => fetchMedicalRecords(resident.id),
  })

  const { data: followups } = useQuery({
    queryKey: ['followups', session?.shelterId],
    queryFn: () => fetchFollowupsByShelterId(session?.shelterId || 'S001'),
    enabled: !!session?.shelterId,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-beige dark:bg-dark-card rounded-2xl p-4 animate-pulse"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-tan dark:bg-dark-border rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-tan dark:bg-dark-border rounded w-2/3" />
                <div className="h-4 bg-tan dark:bg-dark-border rounded w-1/2" />
                <div className="h-3 bg-tan dark:bg-dark-border rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      role="tabpanel"
      id="medical-panel"
      className="space-y-6"
    >
      {/* Medical Records List */}
      {records && records.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-deepbrown dark:text-dark-text flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-amber" />
            Medical History ({records.length})
          </h3>
          {records.map((record: any) => {
            // Find followup for this record
            const followup = followups?.find((f: any) => f.recordId === record.id && !f.completed)
            
            return (
              <MedicalRecordCard 
                key={record.id} 
                record={record} 
                resident={resident}
                followup={followup}
              />
            )
          })}
        </div>
      ) : (
        <div className="bg-beige dark:bg-dark-surface rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-tan dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-6 h-6 text-brown dark:text-dark-muted" />
          </div>
          <p className="text-brown dark:text-dark-muted">
            No medical records yet. Add the first entry below.
          </p>
        </div>
      )}

      {/* Add Form */}
      <AddMedicalRecordForm resident={resident} />
    </motion.div>
  )
}
