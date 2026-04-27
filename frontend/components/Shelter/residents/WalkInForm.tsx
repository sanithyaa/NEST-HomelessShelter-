'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Upload, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWalkInResident } from '@/lib/api'
import { logShelterActivity } from '@/lib/activityLog'

// Validation schema
const walkInSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number()
    .min(1, 'Age must be at least 1')
    .max(120, 'Age must be less than 120'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Gender is required',
  }),
  photo: z.string().optional(),
  notes: z.string().optional(),
})

type WalkInFormData = z.infer<typeof walkInSchema>

interface WalkInFormProps {
  onClose: () => void
}

export function WalkInForm({ onClose }: WalkInFormProps) {
  const queryClient = useQueryClient()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<WalkInFormData>({
    resolver: zodResolver(walkInSchema),
    defaultValues: {
      gender: 'Male',
    },
  })

  // Get shelter ID from session
  const getShelterId = (): string => {
    if (typeof window === 'undefined') return ''
    const session = localStorage.getItem('session')
    if (!session) throw new Error('No session found')
    const user = JSON.parse(session)
    return user.shelterId
  }

  const mutation = useMutation({
    mutationFn: createWalkInResident,
    onSuccess: (data) => {
      if ('queued' in data) {
        toast.success('Resident will be added when online')
      } else {
        toast.success(`${form.getValues('name')} added successfully!`)
        logShelterActivity(`Added walk-in resident: ${form.getValues('name')}`, {
          residentId: data.id,
          residentName: form.getValues('name'),
          action: 'create_walkin',
        })
      }
      
      const shelterId = getShelterId()
      queryClient.invalidateQueries({ queryKey: ['shelter-residents', shelterId] })
      queryClient.invalidateQueries({ queryKey: ['shelter-stats', shelterId] })
      queryClient.invalidateQueries({ queryKey: ['shelter-bed-stats', shelterId] })
      queryClient.invalidateQueries({ queryKey: ['shelter-recent-admissions', shelterId] })
      
      form.reset()
      onClose()
    },
    onError: (error) => {
      toast.error('Failed to add resident')
      console.error('Walk-in creation error:', error)
    },
  })

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Handle photo upload
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('Please select a valid image file (jpg, png, gif)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const base64 = await convertToBase64(file)
      setPhotoPreview(base64)
      form.setValue('photo', base64)
    } catch (error) {
      toast.error('Failed to process image')
      console.error('Image conversion error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // Remove photo
  const handleRemovePhoto = () => {
    setPhotoPreview(null)
    form.setValue('photo', undefined)
  }

  // Form submission
  const onSubmit = async (data: WalkInFormData) => {
    try {
      const shelterId = getShelterId()
      await mutation.mutateAsync({
        ...data,
        shelterId,
      })
    } catch (error) {
      // Error handled in mutation.onError
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          {...form.register('name')}
          type="text"
          placeholder="Enter resident name"
          className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber transition-all"
          aria-required="true"
          aria-invalid={!!form.formState.errors.name}
        />
        {form.formState.errors.name && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-1"
            role="alert"
          >
            {form.formState.errors.name.message}
          </motion.p>
        )}
      </div>

      {/* Age and Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
            Age <span className="text-red-500">*</span>
          </label>
          <input
            id="age"
            {...form.register('age', { valueAsNumber: true })}
            type="number"
            placeholder="Age"
            className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber transition-all"
            aria-required="true"
            aria-invalid={!!form.formState.errors.age}
          />
          {form.formState.errors.age && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs mt-1"
              role="alert"
            >
              {form.formState.errors.age.message}
            </motion.p>
          )}
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            {...form.register('gender')}
            className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber transition-all"
            aria-required="true"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Photo (Optional)
        </label>
        
        {!photoPreview ? (
          <label
            htmlFor="photo"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-brown-200 dark:border-gray-700 rounded-xl cursor-pointer bg-white dark:bg-dark-card hover:bg-tan dark:hover:bg-dark-border transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-amber animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-brown-600 dark:text-brown-400 mb-2" />
                  <p className="text-sm text-brown-600 dark:text-brown-400">
                    Click to upload photo
                  </p>
                  <p className="text-xs text-brown-400 dark:text-brown-500 mt-1">
                    JPG, PNG, or GIF (max 5MB)
                  </p>
                </>
              )}
            </div>
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handlePhotoChange}
              className="hidden"
              disabled={isUploading}
              aria-label="Upload resident photo"
            />
          </label>
        ) : (
          <div className="relative">
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={photoPreview}
              alt="Resident preview"
              className="w-full max-h-48 object-cover rounded-xl border-2 border-brown-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Intake Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Intake Notes (Optional)
        </label>
        <textarea
          id="notes"
          {...form.register('notes')}
          rows={3}
          placeholder="Any observations or notes about the resident..."
          className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber resize-none transition-all"
        />
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
          disabled={mutation.isPending || isUploading}
          className="flex-1 px-4 py-2 bg-amber hover:bg-brown text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Resident'
          )}
        </button>
      </div>
    </form>
  )
}
