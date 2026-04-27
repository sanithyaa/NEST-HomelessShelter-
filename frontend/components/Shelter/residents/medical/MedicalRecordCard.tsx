'use client'

import { motion } from 'framer-motion'
import { Stethoscope, Calendar, User, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { FollowupScheduler } from './FollowupScheduler'

interface MedicalRecordCardProps {
  record: {
    id: string
    diagnosis: string
    doctor?: string
    date: string
    notes?: string
  }
  resident: {
    id: string
    name: string
  }
  followup?: {
    id: string
    date: string
    notes?: string
    completed: boolean
  }
}

export function MedicalRecordCard({ record, resident, followup }: MedicalRecordCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-beige dark:bg-dark-card rounded-2xl p-4 shadow-sm border border-tan dark:border-dark-border"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-deepbrown dark:text-dark-text mb-2">
            {record.diagnosis}
          </h4>
          
          <div className="flex flex-wrap gap-4 mb-3 text-sm">
            {record.doctor && (
              <div className="flex items-center gap-1 text-brown dark:text-dark-muted">
                <User className="w-4 h-4" />
                <span>{record.doctor}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-brown dark:text-dark-muted">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(record.date), 'PPP')}</span>
            </div>
          </div>
          
          {record.notes && (
            <p className="text-sm text-deepbrown dark:text-dark-text bg-white dark:bg-dark-surface rounded-lg p-3 border border-tan/50 dark:border-dark-border mb-3">
              {record.notes}
            </p>
          )}

          {/* Follow-up Info */}
          {followup ? (
            <div className={`p-3 rounded-lg border ${
              followup.completed 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-center gap-2 text-sm">
                {followup.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
                <span className="font-medium text-deepbrown dark:text-dark-text">
                  {followup.completed ? 'Completed Follow-up' : 'Scheduled Follow-up'}
                </span>
                <span className="text-brown dark:text-dark-muted">
                  {format(new Date(followup.date), 'PPP')}
                </span>
              </div>
              {followup.notes && (
                <p className="text-xs text-brown dark:text-dark-muted mt-1 ml-6">
                  {followup.notes}
                </p>
              )}
            </div>
          ) : (
            <FollowupScheduler record={record} resident={resident} />
          )}
        </div>
      </div>
    </motion.div>
  )
}
