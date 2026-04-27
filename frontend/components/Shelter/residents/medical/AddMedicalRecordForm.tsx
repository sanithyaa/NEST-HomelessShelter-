'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Stethoscope } from 'lucide-react'
import { createMedicalRecord } from '@/lib/api'
import { getShelterSession } from '@/lib/shelterAuth'
import toast from 'react-hot-toast'

interface AddMedicalRecordFormProps {
  resident: {
    id: string
    name: string
  }
}

export function AddMedicalRecordForm({ resident }: AddMedicalRecordFormProps) {
  const queryClient = useQueryClient()
  const session = getShelterSession()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      diagnosis: '',
      doctor: '',
      notes: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: { diagnosis: string; doctor: string; notes: string }) =>
      createMedicalRecord({
        residentId: resident.id,
        residentName: resident.name,
        diagnosis: data.diagnosis,
        doctor: data.doctor || undefined,
        notes: data.notes || undefined,
        date: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records', resident.id] })
      toast.success('Medical record added')
      reset()
      
      // Activity logging
      console.log(`Activity: Added medical record for ${resident.name}`)
    },
    onError: () => {
      toast.error('Failed to add medical record')
    },
  })

  const onSubmit = (data: { diagnosis: string; doctor: string; notes: string }) => {
    if (!data.diagnosis.trim()) {
      toast.error('Please enter a diagnosis')
      return
    }
    mutation.mutate(data)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-cream dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-tan dark:border-dark-border mt-4"
    >
      <h3 className="text-lg font-semibold text-deepbrown dark:text-dark-text mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-amber" />
        Add Medical Record
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
            Diagnosis *
          </label>
          <input
            {...register('diagnosis', { required: true })}
            type="text"
            placeholder="Enter diagnosis or condition"
            className="w-full px-4 py-3 border border-tan dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-deepbrown dark:text-dark-text placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-amber"
          />
          {errors.diagnosis && (
            <p className="text-red-500 text-xs mt-1">Diagnosis is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
            Doctor/Provider
          </label>
          <input
            {...register('doctor')}
            type="text"
            placeholder="Doctor or healthcare provider name"
            className="w-full px-4 py-3 border border-tan dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-deepbrown dark:text-dark-text placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            placeholder="Additional notes, treatment details, medications..."
            className="w-full px-4 py-3 border border-tan dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-deepbrown dark:text-dark-text placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-amber resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 border border-tan dark:border-dark-border text-deepbrown dark:text-dark-text rounded-lg hover:bg-tan dark:hover:bg-dark-card transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            {mutation.isPending ? 'Adding...' : 'Add Record'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
