'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { dischargeResident } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface DischargeTabProps {
  resident: {
    id: string
    name: string
    shelterId?: string
  }
}

export function DischargeTab({ resident }: DischargeTabProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [dischargeDate, setDischargeDate] = useState('')
  const [notes, setNotes] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      // If discharge date is set, schedule it; otherwise discharge immediately
      if (dischargeDate) {
        const response = await fetch(`/api/shelter/residents/${resident.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduledDischargeDate: dischargeDate,
            dischargeNotes: notes,
          }),
        })
        if (!response.ok) throw new Error('Failed to schedule discharge')
        return { scheduled: true }
      } else {
        await dischargeResident(resident.id)
        return { scheduled: false }
      }
    },
    onSuccess: (data) => {
      const shelterId = resident.shelterId || 'S001'
      if (data.scheduled) {
        toast.success(`Discharge scheduled for ${resident.name}`)
        queryClient.invalidateQueries({ queryKey: ['shelter-resident', resident.id] })
        queryClient.invalidateQueries({ queryKey: ['shelter-upcoming-discharges', shelterId] })
        setShowConfirm(false)
        setDischargeDate('')
        setNotes('')
      } else {
        toast.success(`${resident.name} has been discharged successfully`)
        queryClient.invalidateQueries({ queryKey: ['shelter-residents'] })
        queryClient.invalidateQueries({ queryKey: ['shelter-stats'] })
        queryClient.invalidateQueries({ queryKey: ['shelter-bed-stats', shelterId] })
        queryClient.invalidateQueries({ queryKey: ['shelter-upcoming-discharges', shelterId] })
        router.push('/shelter/residents')
      }
    },
    onError: () => {
      toast.error('Failed to process discharge')
    },
  })

  const handleDischarge = () => {
    scheduleMutation.mutate()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text mb-2">
            Discharge Resident
          </h2>
          <p className="text-brown dark:text-dark-muted">
            Schedule or process discharge for {resident.name}
          </p>
        </div>

        {!showConfirm ? (
          <>
            {/* Discharge Date */}
            <div>
              <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                Planned Discharge Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-400" />
                <input
                  type="date"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber transition-all"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                Discharge Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add any notes about the discharge..."
                className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber resize-none transition-all"
              />
            </div>

            {/* Warning */}
            <div className="flex gap-3 p-4 bg-amber/10 border border-amber/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
              <div className="text-sm text-deepbrown dark:text-dark-text">
                <p className="font-medium mb-1">Important</p>
                <p className="text-brown dark:text-dark-muted">
                  Discharging this resident will remove them from the active residents list
                  and free up their bed. This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
            >
              {dischargeDate ? 'Schedule Discharge' : 'Discharge Now'}
            </button>
          </>
        ) : (
          <>
            {/* Confirmation */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-2">
                  {dischargeDate ? 'Confirm Schedule' : 'Confirm Discharge'}
                </h3>
                <p className="text-brown dark:text-dark-muted">
                  {dischargeDate ? (
                    <>Schedule discharge for <strong>{resident.name}</strong> on <strong>{new Date(dischargeDate).toLocaleDateString()}</strong>?</>
                  ) : (
                    <>Are you sure you want to discharge <strong>{resident.name}</strong> immediately?</>
                  )}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={scheduleMutation.isPending}
                  className="flex-1 px-6 py-3 bg-tan dark:bg-dark-card text-deepbrown dark:text-dark-text rounded-xl font-medium hover:bg-beige dark:hover:bg-dark-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDischarge}
                  disabled={scheduleMutation.isPending}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {scheduleMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {dischargeDate ? 'Scheduling...' : 'Discharging...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {dischargeDate ? 'Confirm Schedule' : 'Confirm Discharge'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
