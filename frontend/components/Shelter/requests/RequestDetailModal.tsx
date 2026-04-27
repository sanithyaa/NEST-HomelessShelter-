'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Calendar, AlertCircle, Heart, Briefcase, CheckCircle } from 'lucide-react'
import type { AssignmentRequest } from '@/lib/types'
import { format } from 'date-fns'
import { RejectModal } from './RejectModal'

interface RequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: AssignmentRequest | null
  onAccept: () => Promise<void>
  onReject: (reason: string) => Promise<void>
}

const priorityColors = {
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export function RequestDetailModal({
  isOpen,
  onClose,
  request,
  onAccept,
  onReject,
}: RequestDetailModalProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)

  if (!request) return null

  // Extract profile data
  const profile = request.HomelessProfile
  const residentName = profile?.name || 'Unknown'
  const gender = profile?.gender || 'Unknown'
  const age = profile?.age || 0
  const priority = profile?.priority || 'Medium'
  const health = profile?.health_status
  const skills = profile?.skills
  const needs = profile?.needs || request.notes
  const requestDate = request.request_date || request.createdAt
  const profileId = request.profile_id || request.ngoProfileId

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      await onAccept()
      onClose()
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async (reason: string) => {
    await onReject(reason)
    setIsRejectModalOpen(false)
    onClose()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-beige dark:bg-dark-card p-6 border-b border-tan dark:border-dark-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {residentName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text">
                          {residentName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-brown dark:text-dark-muted">
                            {gender}, {age} years
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              priorityColors[priority as keyof typeof priorityColors]
                            }`}
                          >
                            {priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-tan dark:hover:bg-dark-border rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-brown dark:text-dark-muted" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Request Info */}
                  <div className="bg-beige dark:bg-dark-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-amber" />
                      <h3 className="font-semibold text-deepbrown dark:text-dark-text">
                        Request Information
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-brown dark:text-dark-muted">Submitted:</span>
                        <span className="text-deepbrown dark:text-dark-text font-medium">
                          {requestDate && format(new Date(requestDate), 'PPp')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brown dark:text-dark-muted">NGO Profile ID:</span>
                        <span className="text-deepbrown dark:text-dark-text font-medium">
                          {profileId}
                        </span>
                      </div>
                      {request.User && (
                        <div className="flex justify-between">
                          <span className="text-brown dark:text-dark-muted">Requested by:</span>
                          <span className="text-deepbrown dark:text-dark-text font-medium">
                            {request.User.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reason/Needs */}
                  {needs && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-amber" />
                        <h3 className="font-semibold text-deepbrown dark:text-dark-text">
                          Needs & Reason for Referral
                        </h3>
                      </div>
                      <p className="text-deepbrown dark:text-dark-text bg-beige dark:bg-dark-card rounded-xl p-4">
                        {needs}
                      </p>
                    </div>
                  )}

                  {/* Health Info */}
                  {health && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-5 h-5 text-amber" />
                        <h3 className="font-semibold text-deepbrown dark:text-dark-text">
                          Health Information
                        </h3>
                      </div>
                      <p className="text-deepbrown dark:text-dark-text bg-beige dark:bg-dark-card rounded-xl p-4">
                        {health}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {skills && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-5 h-5 text-amber" />
                        <h3 className="font-semibold text-deepbrown dark:text-dark-text">
                          Skills & Experience
                        </h3>
                      </div>
                      <p className="text-deepbrown dark:text-dark-text bg-beige dark:bg-dark-card rounded-xl p-4">
                        {skills}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-white dark:bg-dark-surface p-6 border-t border-tan dark:border-dark-border flex gap-3">
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isAccepting}
                    className="flex-1 px-6 py-3 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                  >
                    {isAccepting ? 'Accepting...' : 'Accept & Admit'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        residentName={residentName}
        onConfirm={handleReject}
      />
    </>
  )
}
