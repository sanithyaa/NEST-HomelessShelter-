'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Shelter, Job } from '@/lib/types'

const shelterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  occupied: z.number().min(0, 'Occupied cannot be negative'),
  phone: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.occupied <= data.capacity, {
  message: 'Occupied count cannot exceed capacity',
  path: ['occupied'],
})

const jobSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  employer: z.string().min(2, 'Employer must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['Full-time', 'Part-time']),
  wage: z.string().optional(),
  description: z.string().optional(),
})

interface ResourceModalProps {
  type: 'shelter' | 'job'
  resource?: Shelter | Job | null
  onClose: () => void
  onSave: (data: any) => void
}

export function ResourceModal({ type, resource, onClose, onSave }: ResourceModalProps) {
  const isShelter = type === 'shelter'
  const schema = isShelter ? shelterSchema : jobSchema

  const { register, handleSubmit, formState: { errors }, watch } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: resource || (isShelter 
      ? { capacity: 10, occupied: 0 }
      : { type: 'Full-time' }
    ),
  })

  const onSubmit = (data: any) => {
    onSave(data)
  }

  // Watch capacity and occupied for real-time validation feedback
  const capacity = watch('capacity')
  const occupied = watch('occupied')

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          data-testid="resource-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 id="modal-title" className="text-2xl font-bold text-deepbrown dark:text-dark-text">
              {resource ? 'Edit' : 'Add'} {isShelter ? 'Shelter' : 'Job'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isShelter ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                    Shelter Name *
                  </label>
                  <input
                    {...register('name')}
                    className="input"
                    placeholder="Safe Haven Shelter"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                    Address *
                  </label>
                  <input
                    {...register('address')}
                    className="input"
                    placeholder="123 Main Street, City"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                      Capacity *
                    </label>
                    <input
                      {...register('capacity', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="50"
                    />
                    {errors.capacity && (
                      <p className="text-red-500 text-xs mt-1">{errors.capacity.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                      Occupied *
                    </label>
                    <input
                      {...register('occupied', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="0"
                    />
                    {errors.occupied && (
                      <p className="text-red-500 text-xs mt-1">{errors.occupied.message as string}</p>
                    )}
                  </div>
                </div>

                {capacity && occupied && occupied > capacity && (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-3">
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      ⚠️ Occupied count ({occupied}) cannot exceed capacity ({capacity})
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                    Phone
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="input"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    className="input min-h-[100px]"
                    placeholder="Additional information about the shelter..."
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                    Job Title *
                  </label>
                  <input
                    {...register('title')}
                    className="input"
                    placeholder="Street Cleaner"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                    Employer *
                  </label>
                  <input
                    {...register('employer')}
                    className="input"
                    placeholder="CityWorks Municipal"
                  />
                  {errors.employer && (
                    <p className="text-red-500 text-xs mt-1">{errors.employer.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                    Location *
                  </label>
                  <input
                    {...register('location')}
                    className="input"
                    placeholder="City Center, Kochi"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">{errors.location.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                      Type *
                    </label>
                    <select {...register('type')} className="input">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                      Wage
                    </label>
                    <input
                      {...register('wage')}
                      className="input"
                      placeholder="₹300/day"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    className="input min-h-[100px]"
                    placeholder="Job description, requirements, benefits..."
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                {resource ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
