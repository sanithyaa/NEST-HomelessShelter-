import { http, HttpResponse } from 'msw'

// Mock shelter users storage
function getShelterUsers() {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_shelter_users')
  if (stored) return JSON.parse(stored)
  
  // Default shelter users
  const defaults = [
    {
      email: 'shelter@example.com',
      password: 'password123',
      name: 'Shelter Manager',
      shelterId: 'S001',
      role: 'Shelter',
    },
  ]
  localStorage.setItem('mock_shelter_users', JSON.stringify(defaults))
  return defaults
}

function saveShelterUsers(users: any[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('mock_shelter_users', JSON.stringify(users))
}

export const shelterAuthHandlers = [
  // Shelter Login
  http.post('/api/shelter/auth/login', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 500))
    
    const body = await request.json() as any
    console.log('Shelter login request:', body)
    
    const users = getShelterUsers()
    const user = users.find(
      (u: any) => u.email === body.email && u.password === body.password
    )
    
    if (!user) {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // If shelterId provided, verify it matches
    if (body.shelterId && body.shelterId !== user.shelterId) {
      return HttpResponse.json(
        { error: 'Invalid shelter ID' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      token: `mock-shelter-token-${Date.now()}`,
      role: 'Shelter',
      name: user.name,
      email: user.email,
      shelterId: user.shelterId,
    })
  }),

  // Shelter Register
  http.post('/api/shelter/auth/register', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 300))
    
    const body = await request.json() as any
    console.log('Shelter register request:', body)
    
    const users = getShelterUsers()
    
    // Check if email already exists
    if (users.find((u: any) => u.email === body.email)) {
      return HttpResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }
    
    // Create new shelter user
    const newUser = {
      email: body.email,
      password: body.password,
      name: body.name,
      shelterId: body.shelterId || `S${Date.now()}`,
      role: 'Shelter',
    }
    
    users.push(newUser)
    saveShelterUsers(users)
    
    return HttpResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        name: newUser.name,
        email: newUser.email,
        shelterId: newUser.shelterId,
      },
    })
  }),
]
