'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleMedicalFollowup } from '@/lib/api'
import { logShelterActivity } from '@/lib/activityLog'

const followupSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

type FollowupFormData = z.infer<typeof followupSchema>

interface FollowupSchedulerProps {
  recordId: string
  residentId: string
  residentName: string
  onClose: () => void
}

export function FollowupScheduler({
  recordId,
  residentId,
  residentName,
  onClose,
}: FollowupSchedulerProps) {
  const queryClient = useQueryClient()

  const form = useForm<FollowupFormData>({
    resolver: zodResolver(followupSchema),
    defaultValues: {
      date: '',
      notes: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FollowupFormData) =>
      scheduleMedicalFollowup(recordId, {
        date: data.date,
        notes: data.notes,
        residentId,
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medical-followups'] })
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      
      if ('queued' in data) {
        toast.success('Follow-up will be scheduled when online')
      } else {
        toast.success('Follow-up scheduled successfully!')
        logShelterActivity(`Scheduled follow-up for ${residentName} on ${variables.date}`, {
          residentId,
          residentName,
          followupDate: variables.date
        })
      }
      
      form.reset()
      onClose()
    },
    onError: () => {
      toast.error('Failed to schedule follow-up')
    },
  })

  const onSubmit = (data: FollowupFormData) => {
    mutation.mutate(data)
  }

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-cream-50 dark:bg-dark-surface rounded-2xl p-6 shadow-2xl z-50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text">
                Schedule Follow-up
              </h2>
              <p className="text-sm text-brown-600 dark:text-brown-400">{residentName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-brown-600 dark:text-brown-400" />
            </button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                Follow-up Date *
              </label>
              <input
                {...form.register('date')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber"
              />
              {form.formState.errors.date && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.date.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                Notes (Optional)
              </label>
              <textarea
                {...form.register('notes')}
                rows={3}
                placeholder="Any additional notes for the follow-up..."
                className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-tan dark:bg-dark-card text-deepbrown dark:text-dark-text rounded-xl hover:bg-beige dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 px-4 py-2 bg-amber hover:bg-brown text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {mutation.isPending ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </form>
        </motion.div>
      </>
    </AnimatePresence>
  )
}
