'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { fetchDailyLogs } from '@/lib/api'
import { LogItem } from '../../residents/logs/LogItem'
import { AddLogForm } from '../../residents/logs/AddLogForm'

interface DailyLogsTabProps {
  resident: {
    id: string
    name: string
  }
}

export function DailyLogsTab({ resident }: DailyLogsTabProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['daily-logs', resident.id],
    queryFn: () => fetchDailyLogs(resident.id),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-beige dark:bg-dark-card rounded-2xl p-4 animate-pulse"
          >
            <div className="h-4 bg-tan dark:bg-dark-border rounded w-3/4 mb-2" />
            <div className="h-3 bg-tan dark:bg-dark-border rounded w-1/2" />
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
      id="logs-panel"
      className="space-y-6"
    >
      {/* Logs List */}
      {logs && logs.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-deepbrown dark:text-dark-text flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber" />
            Activity History ({logs.length})
          </h3>
          {logs.map((log: any) => (
            <LogItem key={log.id} log={log} />
          ))}
        </div>
      ) : (
        <div className="bg-beige dark:bg-dark-surface rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-tan dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-brown dark:text-dark-muted" />
          </div>
          <p className="text-brown dark:text-dark-muted">
            No daily logs yet. Add the first entry below.
          </p>
        </div>
      )}

      {/* Add Form */}
      <AddLogForm resident={resident} />
    </motion.div>
  )
}
