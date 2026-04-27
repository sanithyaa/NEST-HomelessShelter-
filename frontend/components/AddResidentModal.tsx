'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { WalkInForm } from './Shelter/residents/WalkInForm'

interface AddResidentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddResidentModal({ isOpen, onClose }: AddResidentModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-2xl bg-beige dark:bg-dark-bg rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border-2 border-tan dark:border-dark-border"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-tan dark:border-dark-border bg-cream dark:bg-dark-surface">
              <h2 id="modal-title" className="text-2xl font-bold text-deepbrown dark:text-dark-text">
                Add Walk-In Resident
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-brown-600 dark:text-brown-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
              <p className="text-sm text-brown dark:text-dark-muted mb-4">
                Walk-in admission. Elderly, needs assistance with mobility.
              </p>
              <WalkInForm onClose={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
