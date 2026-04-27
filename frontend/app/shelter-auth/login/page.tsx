'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Building2 } from 'lucide-react'
import { ShelterAuthLayout } from '@/components/ShelterAuthLayout'
import { setShelterSession } from '@/lib/shelterAuth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function ShelterLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    const loadingToast = toast.loading('Logging in...')

    try {
      // Call backend API directly
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      
      const response = await fetch(`${API_BASE_URL}/shelter/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.msg || result.error || 'Login failed')
      }

      // Clear any existing regular session
      localStorage.removeItem('session')
      
      // Save shelter session
      setShelterSession({
        token: result.token,
        role: 'Shelter',
        name: result.user.name,
        email: result.user.email,
        shelterId: result.user.shelter_id.toString(),
      })

      toast.dismiss(loadingToast)
      toast.success(`Welcome back, ${result.user.name}!`)

      // Redirect to shelter dashboard
      setTimeout(() => {
        window.location.href = '/dashboard/shelter'
      }, 500)
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(error instanceof Error ? error.message : 'Login failed')
      setIsLoading(false)
    }
  }

  return (
    <ShelterAuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text mb-2">
          Shelter Staff Login
        </h2>
        <p className="text-sm text-brown dark:text-dark-muted">
          Access your shelter management dashboard
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

        <div className="flex items-center">
          <input
            {...form.register('rememberMe')}
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 text-brown bg-gray-100 border-gray-300 rounded focus:ring-brown focus:ring-2"
            disabled={isLoading}
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 text-sm text-deepbrown dark:text-dark-text"
          >
            Remember me
          </label>
        </div>

        <button
          type="submit"
          className="btn-primary w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-brown dark:text-dark-muted">
          Don't have an account?{' '}
          <Link
            href="/shelter-auth/register"
            className="text-amber hover:text-brown font-semibold transition-colors"
          >
            Register as Shelter Staff
          </Link>
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-tan dark:border-dark-border text-center">
        <p className="text-xs text-brown dark:text-dark-muted">
          Demo credentials: shelter@example.com / password123
        </p>
      </div>
    </ShelterAuthLayout>
  )
}
