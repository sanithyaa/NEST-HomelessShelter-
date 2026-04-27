'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Phone, Lock, User } from 'lucide-react'

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Volunteer', 'NGO', 'Admin']),
})

const phoneSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  otp: z.string().optional(),
  role: z.enum(['Volunteer', 'NGO', 'Admin']),
})

type EmailFormData = z.infer<typeof emailSchema>
type PhoneFormData = z.infer<typeof phoneSchema>

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'email' | 'phone'>('email')
  const [otpSent, setOtpSent] = useState(false)
  const [mockOtp, setMockOtp] = useState('')

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { role: 'Volunteer' },
  })

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { role: 'Volunteer' },
  })

  const sendOtp = async (data: PhoneFormData) => {
    const loadingToast = toast.loading('Sending OTP...')
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    toast.dismiss(loadingToast)
    const otp = '123456'
    setMockOtp(otp)
    toast.success(`Mock OTP: ${otp}`, { duration: 5000 })
    setOtpSent(true)
  }

  const onEmailLogin = async (data: EmailFormData) => {
    const loadingToast = toast.loading('Logging in...')
    
    try {
      // Call backend login API
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.msg || 'Login failed')
      }

      // Clear any existing shelter session
      localStorage.removeItem('shelter_session')
      
      // Store session
      localStorage.setItem(
        'session',
        JSON.stringify({
          token: result.token,
          role: result.role || data.role,
          user: result.email || data.email,
          name: result.name,
        })
      )

      toast.dismiss(loadingToast)
      toast.success('Logged in successfully!')
      window.location.href = '/dashboard'
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  const onOtpLogin = async (data: PhoneFormData) => {
    if (!data.otp) {
      toast.error('Please enter OTP')
      return
    }

    if (data.otp === mockOtp) {
      localStorage.setItem(
        'session',
        JSON.stringify({ token: 'mock-token', role: data.role, user: data.phone })
      )
      toast.success('Logged in successfully!')
      
      // Use window.location for reliable navigation
      window.location.href = '/dashboard'
    } else {
      toast.error('Invalid OTP')
    }
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-cream via-tan to-beige dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white dark:bg-dark-surface shadow-2xl rounded-2xl p-8 w-full max-w-md"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-deepbrown dark:text-dark-text mb-2">
            Welcome Back
          </h1>
          <p className="text-brown dark:text-dark-muted">
            Sign in to continue to NEST
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-tan dark:bg-dark-card rounded-xl p-1 flex">
            <button
              onClick={() => {
                setMode('email')
                setOtpSent(false)
              }}
              className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                mode === 'email'
                  ? 'bg-brown text-white shadow-lg'
                  : 'text-deepbrown dark:text-dark-text hover:bg-beige dark:hover:bg-dark-border'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={() => {
                setMode('phone')
                setOtpSent(false)
              }}
              className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                mode === 'phone'
                  ? 'bg-brown text-white shadow-lg'
                  : 'text-deepbrown dark:text-dark-text hover:bg-beige dark:hover:bg-dark-border'
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
          </div>
        </div>

        {/* Email Login Form */}
        {mode === 'email' && (
          <form
            onSubmit={emailForm.handleSubmit(onEmailLogin)}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
                <input
                  {...emailForm.register('email')}
                  type="email"
                  placeholder="your@email.com"
                  className="input pl-10"
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
                <input
                  {...emailForm.register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="input pl-10"
                />
              </div>
              {emailForm.formState.errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {emailForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                Role
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
                <select {...emailForm.register('role')} className="input pl-10">
                  <option value="Volunteer">Volunteer</option>
                  <option value="NGO">NGO Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2"
            >
              Sign In
            </button>
          </form>
        )}

        {/* Phone OTP Login Form */}
        {mode === 'phone' && (
          <form
            onSubmit={phoneForm.handleSubmit(onOtpLogin)}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
                <input
                  {...phoneForm.register('phone')}
                  type="tel"
                  placeholder="9876543210"
                  className="input pl-10"
                  disabled={otpSent}
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            {otpSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                  Enter OTP
                </label>
                <input
                  {...phoneForm.register('otp')}
                  type="text"
                  placeholder="123456"
                  className="input"
                  maxLength={6}
                />
                <p className="text-xs text-amber mt-1">
                  Mock OTP: {mockOtp}
                </p>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
                Role
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
                <select {...phoneForm.register('role')} className="input pl-10">
                  <option value="Volunteer">Volunteer</option>
                  <option value="NGO">NGO Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={phoneForm.handleSubmit(sendOtp)}
                className="btn-primary w-full mt-2"
              >
                Send OTP
              </button>
            ) : (
              <button type="submit" className="btn-primary w-full mt-2">
                Verify & Login
              </button>
            )}
          </form>
        )}

        <p className="text-center mt-6 text-sm text-brown dark:text-dark-muted">
          Don't have an account?{' '}
          <Link
            href="/auth/register"
            className="text-amber hover:text-brown font-semibold transition-colors"
          >
            Register
          </Link>
        </p>

        <div className="mt-4 pt-4 border-t border-tan dark:border-dark-border text-center">
          <p className="text-xs text-brown dark:text-dark-muted">
            Shelter staff?{' '}
            <Link
              href="/shelter-auth/login"
              className="text-amber hover:text-brown font-semibold transition-colors"
            >
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
