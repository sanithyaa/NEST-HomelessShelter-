'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface RejectModalProps {
  isOpen: boolean
  onClose: () => void
  residentName: string
  onConfirm: (reason: string) => Promise<void>
}

export function RejectModal({ isOpen, onClose, residentName, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(reason)
      setReason('')
      onClose()
    } catch (error) {
      toast.error('Failed to reject request')
    } finally {
      setIsSubmitting(false)
    }
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
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-deepbrown dark:text-dark-text">
                    Reject Request
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-brown dark:text-dark-muted" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-brown dark:text-dark-muted">
                  You are about to reject the admission request for{' '}
                  <span className="font-semibold text-deepbrown dark:text-dark-text">
                    {residentName}
                  </span>
                  . Please provide a reason for this decision.
                </p>

                <div>
                  <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Shelter at full capacity, medical needs exceed our capabilities..."
                    className="w-full px-4 py-3 border border-tan dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-deepbrown dark:text-dark-text placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-amber resize-none"
                    rows={4}
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-tan dark:border-dark-border text-deepbrown dark:text-dark-text rounded-lg hover:bg-tan dark:hover:bg-dark-card transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                  >
                    {isSubmitting ? 'Rejecting...' : 'Reject Request'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
