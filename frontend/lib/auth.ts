'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Session structure stored in localStorage
 */
export interface Session {
  token: string
  role: 'Volunteer' | 'NGO' | 'Admin' | 'Shelter'
  user: {
    id: string
    name: string
    email: string
  }
}

/**
 * Get current session from localStorage
 * @returns Session object or null if not logged in
 */
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  
  try {
    const sessionData = localStorage.getItem('session')
    if (!sessionData) return null
    
    const session = JSON.parse(sessionData)
    return session
  } catch (error) {
    console.error('Failed to parse session:', error)
    return null
  }
}

/**
 * Clear current session from localStorage
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('session')
}

/**
 * Hook to protect routes based on user role
 * Redirects to login if user doesn't have required role
 * 
 * @param allowedRoles - Array of roles that can access the route
 * 
 * @example
 * ```tsx
 * function ShelterPage() {
 *   useProtectedRole(['Shelter'])
 *   // ... rest of component
 * }
 * ```
 */
export function useProtectedRole(allowedRoles: string[]): void {
  const router = useRouter()
  
  useEffect(() => {
    const session = getSession()
    
    // Redirect to login if no session or role not allowed
    if (!session || !allowedRoles.includes(session.role)) {
      router.replace('/auth/login')
    }
  }, [allowedRoles, router])
}
