'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Phone, Lock, User, UserCircle } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['Volunteer', 'NGO', 'Admin', 'Shelter']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'Volunteer' },
  })

  const onSubmit = async (data: RegisterFormData) => {
    const loadingToast = toast.loading('Creating account...')
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    toast.dismiss(loadingToast)
    toast.success('Account created successfully!')
    localStorage.setItem(
      'session',
      JSON.stringify({ token: 'mock-token', role: data.role, user: data.email })
    )
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
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
            Create Account
          </h1>
          <p className="text-brown dark:text-dark-muted">
            Join NEST to make a difference
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
              Full Name
            </label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
              <input
                {...form.register('name')}
                type="text"
                placeholder="John Doe"
                className="input pl-10"
              />
            </div>
            {form.formState.errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
              <input
                {...form.register('email')}
                type="email"
                placeholder="your@email.com"
                className="input pl-10"
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
              <input
                {...form.register('phone')}
                type="tel"
                placeholder="9876543210"
                className="input pl-10"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.phone.message}
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
                {...form.register('password')}
                type="password"
                placeholder="••••••••"
                className="input pl-10"
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
              <input
                {...form.register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="input pl-10"
              />
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
              Role
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
              <select {...form.register('role')} className="input pl-10">
                <option value="Volunteer">Volunteer</option>
                <option value="NGO">NGO Staff</option>
                <option value="Admin">Admin</option>
                <option value="Shelter">Shelter</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            Create Account
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-brown dark:text-dark-muted">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-amber hover:text-brown font-semibold transition-colors"
          >
            Sign In
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
