'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, LogOut } from 'lucide-react'
import { dischargeResident } from '@/lib/api'
import { getShelterSession } from '@/lib/shelterAuth'
import toast from 'react-hot-toast'

interface DischargeModalProps {
  isOpen: boolean
  onClose: () => void
  resident: {
    id: string
    name: string
  }
}

export function DischargeModal({ isOpen, onClose, resident }: DischargeModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const session = getShelterSession()

  const mutation = useMutation({
    mutationFn: () => dischargeResident(resident.id),
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['shelter-residents'] })
      queryClient.invalidateQueries({ queryKey: ['shelter-bed-stats'] })
      queryClient.invalidateQueries({ queryKey: ['shelter-upcoming-discharges'] })
      
      toast.success(`${resident.name} has been discharged`)
      
      // Activity logging
      console.log(`Activity: Discharged resident: ${resident.name}`)
      
      // Redirect to residents list
      router.push('/shelter/residents')
    },
    onError: () => {
      toast.error('Failed to discharge resident')
    },
  })

  const handleConfirm = () => {
    mutation.mutate()
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-cream dark:bg-dark-surface rounded-2xl shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text">
                    Discharge Resident?
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  disabled={mutation.isPending}
                  className="p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-brown dark:text-dark-muted" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-sm text-brown dark:text-dark-muted">
                  You are about to discharge{' '}
                  <span className="font-semibold text-deepbrown dark:text-dark-text">
                    {resident.name}
                  </span>{' '}
                  from the shelter. This will remove them from the active resident list.
                </p>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                  <p className="text-xs text-orange-800 dark:text-orange-400">
                    <strong>Note:</strong> This action will update bed occupancy and remove the
                    resident from all active lists. Make sure all necessary records are complete
                    before proceeding.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={mutation.isPending}
                    className="flex-1 px-4 py-2 border border-tan dark:border-dark-border text-deepbrown dark:text-dark-text rounded-lg hover:bg-tan dark:hover:bg-dark-card transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={mutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {mutation.isPending ? 'Discharging...' : 'Confirm Discharge'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
