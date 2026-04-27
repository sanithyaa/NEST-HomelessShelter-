import { http, HttpResponse, passthrough } from 'msw'

export const profileHandlers = [
  // GET all profiles
  http.get('/api/profiles', async () => {
    // This should pass through to the real API
    return passthrough()
  }),

  // GET single profile
  http.get('/api/profiles/:id', async ({ params }) => {
    const { id } = params

    await new Promise((resolve) => setTimeout(resolve, 800))

    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      const profiles = JSON.parse(localStorage.getItem('profiles') || '[]')
      const profile = profiles.find((p: any) => p.id === id)
      if (profile) {
        return HttpResponse.json(profile)
      }
    }

    // Return mock profile if not found
    return HttpResponse.json({
      id,
      name: 'John Doe',
      alias: 'Johnny',
      age: 35,
      gender: 'Male',
      location: { lat: 9.9312, lng: 76.2673 },
      locationName: 'MG Road, Kochi, Kerala, India',
      health: 'Diabetes, requires regular medication',
      disabilities: 'None',
      skills: 'Carpentry, basic electrical work',
      workHistory: 'Worked as carpenter for 10 years',
      needs: 'Shelter, medical care, job placement',
      priority: 'High',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }),

  // PUT update profile
  http.put('/api/profiles/:id', async ({ request, params }) => {
    const { id } = params
    const body = await request.json()

    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update in localStorage
    if (typeof window !== 'undefined') {
      const profiles = JSON.parse(localStorage.getItem('profiles') || '[]')
      const index = profiles.findIndex((p: any) => p.id === id)
      if (index !== -1) {
        profiles[index] = { ...profiles[index], ...body }
        localStorage.setItem('profiles', JSON.stringify(profiles))
        return HttpResponse.json(profiles[index])
      }
    }

    return HttpResponse.json({ ...body, id })
  }),

  // POST create profile
  http.post('/api/profiles', async ({ request }) => {
    const body = await request.json()
    
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newProfile = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      ...body,
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const profiles = JSON.parse(localStorage.getItem('profiles') || '[]')
      profiles.push(newProfile)
      localStorage.setItem('profiles', JSON.stringify(profiles))
    }

    return HttpResponse.json(newProfile)
  }),
]
