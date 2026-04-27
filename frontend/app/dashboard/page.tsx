'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    try {
      // Check regular session first (NGO/Admin/Volunteer)
      const regularSession = localStorage.getItem('session')
      if (regularSession) {
        const session = JSON.parse(regularSession)
        const role = session?.role || 'Volunteer'
        
        if (role === 'NGO') {
          window.location.href = '/dashboard/ngo'
          return
        } else if (role === 'Admin') {
          window.location.href = '/dashboard/admin'
          return
        } else if (role === 'Volunteer') {
          window.location.href = '/dashboard/volunteer'
          return
        }
      }

      // Only check shelter session if no regular session exists
      const shelterSession = localStorage.getItem('shelter_session')
      if (shelterSession) {
        const session = JSON.parse(shelterSession)
        if (session.role === 'Shelter') {
          window.location.href = '/dashboard/shelter'
          return
        }
      }

      // No valid session found, redirect to login
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Error reading session:', error)
      window.location.href = '/auth/login'
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber mx-auto mb-4"></div>
        <p className="text-brown dark:text-dark-muted">Loading dashboard...</p>
      </div>
    </div>
  )
}
