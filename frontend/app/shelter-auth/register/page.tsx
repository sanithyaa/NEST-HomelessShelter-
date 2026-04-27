'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Building2 } from 'lucide-react'
import { ShelterAuthLayout } from '@/components/ShelterAuthLayout'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    shelterId: z.string().min(1, 'Shelter ID is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function ShelterRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    const loadingToast = toast.loading('Creating account...')

    try {
      const response = await fetch('/api/shelter/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          shelterId: data.shelterId,
          role: 'Shelter',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      toast.dismiss(loadingToast)
      toast.success('Account created successfully! Please login.')

      // Redirect to shelter login
      setTimeout(() => {
        router.push('/shelter-auth/login')
      }, 1500)
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(error instanceof Error ? error.message : 'Registration failed')
      setIsLoading(false)
    }
  }

  return (
    <ShelterAuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text mb-2">
          Register Shelter Staff
        </h2>
        <p className="text-sm text-brown dark:text-dark-muted">
          Create an account to manage your shelter
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
            <input
              {...form.register('name')}
              type="text"
              placeholder="John Doe"
              className="input pl-10"
              disabled={isLoading}
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
              placeholder="shelter@example.com"
              className="input pl-10"
              disabled={isLoading}
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
            Shelter ID
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
            <input
              {...form.register('shelterId')}
              type="text"
              placeholder="S001"
              className="input pl-10"
              disabled={isLoading}
            />
          </div>
          {form.formState.errors.shelterId && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.shelterId.message}
            </p>
          )}
          <p className="text-xs text-brown dark:text-dark-muted mt-1">
            Your unique shelter identification code
          </p>
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-brown dark:text-dark-muted">
          Already have an account?{' '}
          <Link
            href="/shelter-auth/login"
            className="text-amber hover:text-brown font-semibold transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </ShelterAuthLayout>
  )
}
