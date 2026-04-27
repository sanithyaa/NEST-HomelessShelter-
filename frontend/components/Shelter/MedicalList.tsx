'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, User, Stethoscope, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { fetchMedicalRecords } from '@/lib/api'
import { FollowupScheduler } from './FollowupScheduler'

interface MedicalListProps {
  residentId?: string
  onAddRecord?: () => void
}

export function MedicalList({ residentId, onAddRecord }: MedicalListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [schedulingFor, setSchedulingFor] = useState<string | null>(null)

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['medical-records', residentId],
    queryFn: () => fetchMedicalRecords(residentId),
  })

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="medical-list">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-cream-50 dark:bg-dark-surface rounded-2xl p-6 shadow-lg animate-pulse"
          >
            <div className="h-6 bg-tan dark:bg-dark-card rounded w-3/4 mb-4" />
            <div className="h-4 bg-tan dark:bg-dark-card rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div
        className="bg-cream-50 dark:bg-dark-surface rounded-2xl p-12 text-center shadow-lg"
        data-testid="medical-list"
      >
        <Stethoscope className="w-16 h-16 text-brown-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-2">
          No Medical Records
        </h3>
        <p className="text-brown-600 dark:text-brown-400 mb-6">
          {residentId
            ? 'No medical records for this resident yet.'
            : 'No medical records in the system yet.'}
        </p>
        {onAddRecord && (
          <button onClick={onAddRecord} className="btn-primary">
            <Plus className="w-4 h-4 inline mr-2" />
            Add Medical Record
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="medical-list">
      <AnimatePresence mode="popLayout">
        {records.map((record, index) => (
          <motion.div
            key={record.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-cream-50 dark:bg-dark-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-amber"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {!residentId && (
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-amber" />
                      <span className="text-sm font-semibold text-deepbrown dark:text-dark-text">
                        {record.residentName}
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-deepbrown dark:text-dark-text">
                    {record.diagnosis}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-brown-600 dark:text-brown-400">
                    <span>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {record.doctor && <span>Dr. {record.doctor}</span>}
                  </div>
                </div>

                {record.followUpDate && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber/20 rounded-lg">
                    <Calendar className="w-4 h-4 text-amber" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
                      Follow-up:{' '}
                      {new Date(record.followUpDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Notes (expandable) */}
              {record.notes && (
                <div>
                  <button
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                    className="flex items-center gap-2 text-sm text-brown-600 dark:text-brown-400 hover:text-brown-800 dark:hover:text-brown-200 transition-colors"
                  >
                    {expandedId === record.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    View notes
                  </button>
                  <AnimatePresence>
                    {expandedId === record.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-2 text-sm text-brown-800 dark:text-brown-200 bg-white dark:bg-dark-card p-3 rounded-xl">
                          {record.notes}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSchedulingFor(record.id)}
                  className="px-4 py-2 bg-amber hover:bg-brown text-white rounded-xl transition-colors text-sm font-medium"
                >
                  Schedule Follow-up
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Follow-up Scheduler */}
      {schedulingFor && (
        <FollowupScheduler
          recordId={schedulingFor}
          residentId={records.find((r) => r.id === schedulingFor)?.residentId || ''}
          residentName={records.find((r) => r.id === schedulingFor)?.residentName || ''}
          onClose={() => setSchedulingFor(null)}
        />
      )}
    </div>
  )
}
