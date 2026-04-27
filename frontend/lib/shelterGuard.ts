'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getShelterSession, ShelterSession } from './shelterAuth'

/**
 * Hook to protect shelter-only pages
 * Redirects to shelter login if not authenticated as shelter staff
 */
export function useShelterGuard(): ShelterSession | null {
  const router = useRouter()
  const session = getShelterSession()

  useEffect(() => {
    if (!session || session.role !== 'Shelter') {
      router.replace('/shelter-auth/login')
    }
  }, [session, router])

  return session
}
