import { http, HttpResponse } from 'msw'

// In-memory storage for followups (persists during session)
let followupsStore: any[] = []
let initialized = false

function initializeFollowups() {
  if (initialized || typeof window === 'undefined') return
  
  const stored = localStorage.getItem('followups')
  if (stored) {
    followupsStore = JSON.parse(stored)
    initialized = true
    return
  }
  
  // Get all profiles from localStorage to create sample followups
  const profiles = JSON.parse(localStorage.getItem('profiles') || '[]')
  
  if (profiles.length === 0) {
    // No profiles yet, just initialize empty
    followupsStore = []
    initialized = true
    return
  }
  
  followupsStore = []
  
  // Create sample followups for each profile
  profiles.forEach((profile: any) => {
    followupsStore.push(
      {
        id: `f${profile.id}-1`,
        profileId: profile.id,
        type: 'Initial Contact',
        note: 'First meeting with individual. Assessed immediate needs.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: true,
        createdBy: 'Volunteer',
      },
      {
        id: `f${profile.id}-2`,
        profileId: profile.id,
        type: 'Medical Checkup',
        note: 'Scheduled appointment at Community Health Clinic.',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed: true,
        createdBy: 'NGO Staff',
      },
      {
        id: `f${profile.id}-3`,
        profileId: profile.id,
        type: 'Follow-up',
        note: 'Check on shelter placement status.',
        date: new Date().toISOString(),
        completed: false,
        createdBy: 'Volunteer',
      }
    )
  })
  
  saveToLocalStorage()
  initialized = true
}

function saveToLocalStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('followups', JSON.stringify(followupsStore))
  }
}

export const followupHandlers = [
  // GET followups for a profile
  http.get('/api/followups', async ({ request }) => {
    initializeFollowups() // Lazy initialization
    
    const url = new URL(request.url)
    const profileId = url.searchParams.get('profileId')

    await new Promise((resolve) => setTimeout(resolve, 100))

    const filtered = followupsStore.filter((f) => f.profileId === profileId)
    return HttpResponse.json(filtered)
  }),

  // POST create new followup
  http.post('/api/followups', async ({ request }) => {
    const body = (await request.json()) as any
    
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newFollowup = {
      id: `f${Date.now()}`,
      ...body,
      completed: false,
    }

    followupsStore.push(newFollowup)
    saveToLocalStorage()

    return HttpResponse.json(newFollowup)
  }),

  // PATCH update followup
  http.patch('/api/followups/:id', async ({ request, params }) => {
    const { id } = params
    const body = (await request.json()) as any

    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = followupsStore.findIndex((f) => f.id === id)
    if (index !== -1) {
      followupsStore[index] = { ...followupsStore[index], ...body }
      saveToLocalStorage()
      return HttpResponse.json(followupsStore[index])
    }

    return HttpResponse.json({ error: 'Followup not found' }, { status: 404 })
  }),
]
