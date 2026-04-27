'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, User } from 'lucide-react'
import { format } from 'date-fns'
import { markFollowupCompleted } from '@/lib/api'
import { getShelterSession } from '@/lib/shelterAuth'
import toast from 'react-hot-toast'

interface FollowupCardProps {
  followup: {
    id: string
    residentName: string
    date: string
    notes?: string
    completed: boolean
    recordId: string
  }
  diagnosis?: string
}

export function FollowupCard({ followup, diagnosis }: FollowupCardProps) {
  const queryClient = useQueryClient()
  const session = getShelterSession()

  const mutation = useMutation({
    mutationFn: () => markFollowupCompleted(followup.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups', session?.shelterId] })
      toast.success('Follow-up marked as completed')
      
      // Activity logging
      console.log(`Activity: Completed follow-up for ${followup.residentName}`)
    },
    onError: () => {
      toast.error('Failed to mark follow-up as completed')
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 border ${
        followup.completed
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-dark-card border-tan dark:border-dark-border'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-amber" />
            <h4 className="font-semibold text-deepbrown dark:text-dark-text">
              {followup.residentName}
            </h4>
          </div>
          
          {diagnosis && (
            <p className="text-sm text-brown dark:text-dark-muted mb-2">
              {diagnosis}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-sm text-brown dark:text-dark-muted mb-2">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(followup.date), 'PPP')}</span>
          </div>
          
          {followup.notes && (
            <p className="text-sm text-deepbrown dark:text-dark-text bg-beige dark:bg-dark-surface rounded-lg p-2 border border-tan/50 dark:border-dark-border">
              {followup.notes}
            </p>
          )}
        </div>
        
        {!followup.completed && (
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center gap-2 whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            {mutation.isPending ? 'Marking...' : 'Complete'}
          </button>
        )}
        
        {followup.completed && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </div>
        )}
      </div>
    </motion.div>
  )
}
