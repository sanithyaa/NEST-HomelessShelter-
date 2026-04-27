/**
 * Shelter Authentication Utilities
 * Manages shelter staff session separately from main auth
 */

export interface ShelterSession {
  token: string
  role: 'Shelter'
  name: string
  email: string
  shelterId: string
}

export function getShelterSession(): ShelterSession | null {
  if (typeof window === 'undefined') return null
  try {
    const session = localStorage.getItem('shelter_session')
    return session ? JSON.parse(session) : null
  } catch {
    return null
  }
}

export function setShelterSession(session: ShelterSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('shelter_session', JSON.stringify(session))
}

export function clearShelterSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('shelter_session')
}

export function isShelterStaff(): boolean {
  return getShelterSession() !== null
}
