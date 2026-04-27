'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createMedicalRecord, getShelterResidents } from '@/lib/api'
import { logShelterActivity } from '@/lib/activityLog'

const medicalRecordSchema = z.object({
  residentId: z.string().min(1, 'Resident is required'),
  diagnosis: z.string().min(3, 'Diagnosis must be at least 3 characters'),
  doctor: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
})

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>

interface MedicalRecordModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedResidentId?: string
  preselectedResidentName?: string
}

export function MedicalRecordModal({
  isOpen,
  onClose,
  preselectedResidentId,
  preselectedResidentName,
}: MedicalRecordModalProps) {
  const queryClient = useQueryClient()

  const { data: residents = [] } = useQuery({
    queryKey: ['shelter-residents'],
    queryFn: getShelterResidents,
    enabled: !preselectedResidentId,
  })

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      residentId: preselectedResidentId || '',
      diagnosis: '',
      doctor: '',
      notes: '',
      followUpDate: '',
    },
  })

  const mutation = useMutation({
    mutationFn: createMedicalRecord,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      queryClient.invalidateQueries({ queryKey: ['medical-followups'] })
      
      if ('queued' in data) {
        toast.success('Medical record will be added when online')
      } else {
        toast.success('Medical record added successfully!')
        logShelterActivity(`Created medical record for ${data.residentName}`, { 
          recordId: data.id, 
          residentName: data.residentName 
        })
      }
      
      form.reset()
      onClose()
    },
    onError: () => {
      toast.error('Failed to add medical record')
    },
  })

  const onSubmit = (data: MedicalRecordFormData) => {
    const residentName =
      preselectedResidentName ||
      residents.find((r) => r.id === data.residentId)?.name ||
      'Unknown'

    mutation.mutate({
      ...data,
      residentName,
      date: new Date().toISOString(),
    })
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-cream-50 dark:bg-dark-surface rounded-2xl p-6 shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            data-testid="medical-record-modal"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text">
                Add Medical Record
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-brown-600 dark:text-brown-400" />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Resident Selection */}
              {!preselectedResidentId && (
                <div>
                  <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                    Resident *
                  </label>
                  <select
                    {...form.register('residentId')}
                    className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber"
                  >
                    <option value="">Select a resident</option>
                    {residents.map((resident) => (
                      <option key={resident.id} value={resident.id}>
                        {resident.name} - Bed {resident.bedNumber}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.residentId && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.residentId.message}
                    </p>
                  )}
                </div>
              )}

              {preselectedResidentId && (
                <div className="bg-amber/10 border border-amber/30 rounded-xl p-3">
                  <p className="text-sm text-deepbrown dark:text-dark-text">
                    <span className="font-semibold">Resident:</span> {preselectedResidentName}
                  </p>
                </div>
              )}

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                  Diagnosis *
                </label>
                <input
                  {...form.register('diagnosis')}
                  type="text"
                  placeholder="Enter diagnosis"
                  className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber"
                />
                {form.formState.errors.diagnosis && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.diagnosis.message}
                  </p>
                )}
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                  Doctor (Optional)
                </label>
                <input
                  {...form.register('doctor')}
                  type="text"
                  placeholder="Dr. Name"
                  className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  {...form.register('notes')}
                  rows={4}
                  placeholder="Additional notes, treatment details, observations..."
                  className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber resize-none"
                />
              </div>

              {/* Follow-up Date */}
              <div>
                <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                  Schedule Follow-up (Optional)
                </label>
                <input
                  {...form.register('followUpDate')}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber"
                />
                <p className="text-xs text-brown-600 dark:text-brown-400 mt-1">
                  If set, a follow-up will be automatically scheduled
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
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
                  {mutation.isPending ? 'Adding...' : 'Add Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
