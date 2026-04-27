'use client'

import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { draftStore } from '@/lib/localdb'
import { QRCodeCanvas } from 'qrcode.react'
import { useRouter } from 'next/navigation'
import { logActivity } from '@/lib/activityLog'
import {
  MapPin,
  User,
  Heart,
  Briefcase,
  ClipboardList,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import map to avoid SSR issues
const MapSelector = dynamic(() => import('@/components/MapSelector'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-tan dark:bg-dark-surface rounded-xl flex items-center justify-center">
      <p className="text-brown dark:text-dark-muted">Loading map...</p>
    </div>
  ),
})

const schema = z.object({
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  locationName: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  alias: z.string().optional(),
  age: z.number().min(1, 'Age must be at least 1').max(120, 'Age must be less than 120'),
  gender: z.enum(['Male', 'Female', 'Other']),
  photo: z.string().optional(),
  health: z.string().optional(),
  disabilities: z.string().optional(),
  skills: z.string().optional(),
  workHistory: z.string().optional(),
  needs: z.string().min(1, 'Please specify at least one need'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must provide consent to continue',
  }),
})

type FormData = z.infer<typeof schema>

const steps = [
  { id: 1, title: 'Location', icon: MapPin, description: 'Where was this person found?' },
  { id: 2, title: 'Basic Info', icon: User, description: 'Personal details' },
  { id: 3, title: 'Health', icon: Heart, description: 'Medical information' },
  { id: 4, title: 'Skills & Work', icon: Briefcase, description: 'Employment history' },
  { id: 5, title: 'Needs', icon: ClipboardList, description: 'Immediate requirements' },
  { id: 6, title: 'Consent', icon: CheckCircle, description: 'Final confirmation' },
]

export default function ProfileCreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [profileId, setProfileId] = useState('')
  const [showConsentModal, setShowConsentModal] = useState(false)

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      gender: 'Male',
      priority: 'Medium',
      consent: false,
    },
  })

  // Autosave to IndexedDB
  useEffect(() => {
    const subscription = methods.watch(async (data) => {
      try {
        await draftStore.setItem('draft', data)
      } catch (error) {
        console.error('Autosave failed:', error)
      }
    })

    // Load saved draft
    const loadDraft = async () => {
      try {
        const saved = await draftStore.getItem<FormData>('draft')
        if (saved) {
          methods.reset(saved)
          toast.success('Draft restored', { duration: 2000 })
        }
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }

    loadDraft()

    return () => subscription.unsubscribe()
  }, [methods])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const loadingToast = toast.loading('Submitting profile...')

    try {
      // INTEGRATION: Call backend API to save profile to PostgreSQL
      // This also triggers AI analysis automatically
      const { createProfile } = await import('@/lib/api')
      
      const profile = await createProfile({
        name: data.name,
        alias: data.alias,
        age: data.age,
        gender: data.gender,
        location: data.location,
        locationName: data.locationName,
        health: data.health,
        disabilities: data.disabilities,
        skills: data.skills,
        workHistory: data.workHistory,
        needs: data.needs,
        priority: data.priority,
      })
      
      // Profile saved to database and AI analysis triggered!
      setProfileId(profile.profile_id.toString())
      setSubmitted(true)

      await draftStore.removeItem('draft')
      toast.dismiss(loadingToast)
      toast.success('Profile created and saved to database!')
      logActivity(`🧍 Profile created: ${data.name} (ID: ${profile.profile_id})`)
    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit profile'
      toast.error(`Error: ${errorMessage}`)
      console.error('Profile creation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    const fields = getFieldsForStep(step)
    const isValid = await methods.trigger(fields)

    if (isValid) {
      if (step === 5) {
        setShowConsentModal(true)
      } else {
        setStep((s) => Math.min(6, s + 1))
      }
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1))
  }

  const getFieldsForStep = (currentStep: number): (keyof FormData)[] => {
    switch (currentStep) {
      case 1:
        return ['location']
      case 2:
        return ['name', 'age', 'gender']
      case 3:
        return []
      case 4:
        return []
      case 5:
        return ['needs', 'priority']
      case 6:
        return ['consent']
      default:
        return []
    }
  }

  if (submitted) {
    const profileUrl = `${window.location.origin}/profiles/${profileId}`
    
    const handleDownloadQR = () => {
      const canvas = document.getElementById('qr-code') as HTMLCanvasElement
      if (canvas) {
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `profile-${profileId}-qr.png`
        link.href = url
        link.click()
        toast.success('QR code downloaded!')
      }
    }

    const handlePrintCard = () => {
      window.print()
      toast.success('Opening print dialog...')
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md w-full text-center space-y-6"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-deepbrown dark:text-dark-text">
            Profile Created!
          </h2>
          <p className="text-brown dark:text-dark-muted">
            Profile ID: <span className="font-mono font-bold">{profileId}</span>
          </p>
          <div className="bg-white p-4 rounded-xl inline-block">
            <QRCodeCanvas 
              id="qr-code"
              value={profileUrl} 
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="bg-tan dark:bg-dark-surface p-4 rounded-xl text-left space-y-2">
            <p className="text-sm text-brown dark:text-dark-muted">
              <strong>📱 Scan to view profile:</strong>
            </p>
            <p className="text-xs text-brown/70 dark:text-dark-muted break-all">
              {profileUrl}
            </p>
            <p className="text-xs text-brown/70 dark:text-dark-muted mt-2">
              💡 This QR code links directly to the profile page. Anyone who scans it can view the full profile information.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDownloadQR}
                className="bg-amber hover:bg-brown text-white px-6 py-2 rounded-xl transition-all duration-300 flex items-center gap-2"
              >
                📥 Download QR
              </button>
              <button
                onClick={handlePrintCard}
                className="bg-brown hover:bg-deepbrown text-white px-6 py-2 rounded-xl transition-all duration-300 flex items-center gap-2"
              >
                🖨️ Print Card
              </button>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setStep(1)
                  methods.reset()
                }}
                className="btn-secondary"
              >
                Create Another
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-deepbrown dark:text-dark-text mb-2">
            Create Profile
          </h1>
          <p className="text-brown dark:text-dark-muted">
            Step {step} of {steps.length}: {steps[step - 1].title}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-beige dark:bg-dark-surface h-3 rounded-full overflow-hidden">
          <motion.div
            className="h-3 bg-gradient-to-r from-amber to-brown"
            initial={{ width: 0 }}
            animate={{ width: `${(step / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-between">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`flex flex-col items-center gap-2 ${
                s.id === step
                  ? 'text-amber'
                  : s.id < step
                  ? 'text-green-500'
                  : 'text-brown/30 dark:text-dark-muted'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  s.id === step
                    ? 'bg-amber text-white'
                    : s.id < step
                    ? 'bg-green-500 text-white'
                    : 'bg-tan dark:bg-dark-surface'
                }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="card space-y-4"
            >
              {step === 1 && <Step1Location />}
              {step === 2 && <Step2BasicInfo />}
              {step === 3 && <Step3Health />}
              {step === 4 && <Step4Skills />}
              {step === 5 && <Step5Needs />}
              {step === 6 && <Step6Consent />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <div className="flex-1" />
            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Profile'}
              </button>
            )}
          </div>
        </form>

        {/* Consent Modal */}
        {showConsentModal && (
          <ConsentModal
            onConfirm={() => {
              setShowConsentModal(false)
              setStep(6)
            }}
            onCancel={() => setShowConsentModal(false)}
          />
        )}
      </div>
    </FormProvider>
  )
}

// Step Components
function Step1Location() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text flex items-center gap-2">
        <MapPin className="w-6 h-6 text-amber" />
        Location
      </h2>
      <p className="text-brown dark:text-dark-muted">
        Click on the map to mark where this person was found or currently resides.
      </p>
      <MapSelector />
    </div>
  )
}

function Step2BasicInfo() {
  const { register, formState: { errors } } = useFormContext<FormData>()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text flex items-center gap-2">
        <User className="w-6 h-6 text-amber" />
        Basic Information
      </h2>

      <div>
        <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Full Name *
        </label>
        <input
          {...register('name')}
          placeholder="John Doe"
          className="input"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Alias / Known As
        </label>
        <input
          {...register('alias')}
          placeholder="Optional nickname"
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
            Age *
          </label>
          <input
            {...register('age', { valueAsNumber: true })}
            type="number"
            placeholder="25"
            className="input"
          />
          {errors.age && (
            <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
            Gender *
          </label>
          <select {...register('gender')} className="input">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function Step3Health() {
  const { register } = useFormContext<FormData>()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text flex items-center gap-2">
        <Heart className="w-6 h-6 text-amber" />
        Health Information
      </h2>
      <p className="text-brown dark:text-dark-muted">
        Document any known health conditions or medical needs.
      </p>

      <div>
        <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Health Conditions
        </label>
        <textarea
          {...register('health')}
          placeholder="Any known medical conditions, allergies, or ongoing treatments..."
          className="input min-h-[100px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Disabilities or Special Needs
        </label>
        <textarea
          {...register('disabilities')}
          placeholder="Physical or mental disabilities that require special attention..."
          className="input min-h-[100px]"
        />
      </div>
    </div>
  )
}

function Step4Skills() {
  const { register } = useFormContext<FormData>()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-amber" />
        Skills & Work History
      </h2>
      <p className="text-brown dark:text-dark-muted">
        Help us understand their capabilities and experience.
      </p>

      <div>
        <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Skills & Abilities
        </label>
        <textarea
          {...register('skills')}
          placeholder="Carpentry, cooking, computer skills, languages spoken, etc..."
          className="input min-h-[100px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Previous Work Experience
        </label>
        <textarea
          {...register('workHistory')}
          placeholder="Previous jobs, duration, responsibilities..."
          className="input min-h-[100px]"
        />
      </div>
    </div>
  )
}

function Step5Needs() {
  const { register, formState: { errors } } = useFormContext<FormData>()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-amber" />
        Needs & Priority
      </h2>
      <p className="text-brown dark:text-dark-muted">
        What does this person need most urgently?
      </p>

      <div>
        <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Immediate Needs *
        </label>
        <textarea
          {...register('needs')}
          placeholder="Food, shelter, medical care, job placement, clothing, etc..."
          className="input min-h-[120px]"
        />
        {errors.needs && (
          <p className="text-red-500 text-xs mt-1">{errors.needs.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
          Priority Level *
        </label>
        <select {...register('priority')} className="input">
          <option value="Low">Low - Can wait</option>
          <option value="Medium">Medium - Important</option>
          <option value="High">High - Urgent</option>
          <option value="Critical">Critical - Immediate attention needed</option>
        </select>
      </div>
    </div>
  )
}

function Step6Consent() {
  const { register, formState: { errors } } = useFormContext<FormData>()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text flex items-center gap-2">
        <CheckCircle className="w-6 h-6 text-amber" />
        Consent & Confirmation
      </h2>

      <div className="bg-tan dark:bg-dark-surface p-6 rounded-xl space-y-4">
        <h3 className="font-semibold text-deepbrown dark:text-dark-text">
          Data Privacy Notice
        </h3>
        <p className="text-sm text-brown dark:text-dark-muted">
          The information collected will be used solely for the purpose of providing
          humanitarian aid and connecting individuals with appropriate resources. All
          data is stored securely and will not be shared with third parties without
          explicit consent.
        </p>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('consent')}
            className="mt-1 w-5 h-5 text-amber focus:ring-amber rounded"
          />
          <span className="text-sm text-deepbrown dark:text-dark-text">
            I confirm that I have informed the individual about this data collection
            and have received their consent to store and use this information for aid
            purposes. *
          </span>
        </label>
        {errors.consent && (
          <p className="text-red-500 text-xs">{errors.consent.message}</p>
        )}
      </div>
    </div>
  )
}

function ConsentModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full"
      >
        <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-4">
          Ready to proceed?
        </h3>
        <p className="text-brown dark:text-dark-muted mb-6">
          You're about to move to the final step. Please ensure all information is
          accurate before submitting.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Review Again
          </button>
          <button onClick={onConfirm} className="btn-primary flex-1">
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  )
}
