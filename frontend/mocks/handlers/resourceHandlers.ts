import { http, HttpResponse } from 'msw'
import { Shelter, Job } from '@/lib/types'

// Initialize storage
function getStoredShelters(): Shelter[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_shelters')
  if (stored) return JSON.parse(stored)
  
  // Default shelters
  const defaults: Shelter[] = [
    {
      id: 's1',
      name: 'Safe Haven Shelter',
      address: '123 Main Street, Kochi, Kerala',
      capacity: 50,
      occupied: 42,
      phone: '+91 98765 43210',
      notes: '24/7 access, meals provided, medical support available',
      createdAt: new Date().toISOString(),
    },
    {
      id: 's2',
      name: 'Hope House',
      address: '456 Park Road, Kochi, Kerala',
      capacity: 30,
      occupied: 15,
      phone: '+91 98765 43211',
      notes: 'Family-friendly, medical support, counseling services',
      createdAt: new Date().toISOString(),
    },
    {
      id: 's3',
      name: 'Community Care Center',
      address: '789 Church Lane, Kochi, Kerala',
      capacity: 25,
      occupied: 25,
      phone: '+91 98765 43212',
      notes: 'Currently full, waitlist available',
      createdAt: new Date().toISOString(),
    },
    {
      id: 's4',
      name: 'Sunrise Shelter',
      address: '321 Beach Road, Kochi, Kerala',
      capacity: 40,
      occupied: 28,
      phone: '+91 98765 43213',
      notes: 'Women and children priority, educational programs',
      createdAt: new Date().toISOString(),
    },
    {
      id: 's5',
      name: 'New Beginnings Home',
      address: '555 Garden Street, Kochi, Kerala',
      capacity: 35,
      occupied: 20,
      phone: '+91 98765 43214',
      notes: 'Job training programs, substance abuse support',
      createdAt: new Date().toISOString(),
    },
  ]
  localStorage.setItem('mock_shelters', JSON.stringify(defaults))
  return defaults
}

function getStoredJobs(): Job[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_jobs')
  if (stored) return JSON.parse(stored)
  
  // Default jobs
  const defaults: Job[] = [
    {
      id: 'j1',
      title: 'Street Cleaner',
      employer: 'CityWorks Municipal',
      location: 'Kochi City Center',
      type: 'Part-time',
      wage: '₹300/day',
      description: 'Morning shift, 6 AM - 12 PM. Training provided. No experience required.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'j2',
      title: 'Kitchen Helper',
      employer: 'Community Kitchen',
      location: 'MG Road, Kochi',
      type: 'Full-time',
      wage: '₹12,000/month',
      description: 'Food preparation and cleaning. Meals included. Flexible schedule.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'j3',
      title: 'Warehouse Assistant',
      employer: 'Logistics Co.',
      location: 'Industrial Area, Kochi',
      type: 'Full-time',
      wage: '₹15,000/month',
      description: 'Loading/unloading, inventory management. Physical work required.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'j4',
      title: 'Gardener',
      employer: 'Green Spaces NGO',
      location: 'Various Parks, Kochi',
      type: 'Part-time',
      wage: '₹350/day',
      description: 'Plant care, lawn maintenance. Outdoor work. Training provided.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'j5',
      title: 'Security Guard',
      employer: 'SafeWatch Security',
      location: 'Commercial Complex, Kochi',
      type: 'Full-time',
      wage: '₹14,000/month',
      description: 'Night shift available. Accommodation assistance provided.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'j6',
      title: 'Delivery Assistant',
      employer: 'QuickDeliver Services',
      location: 'Kochi Metro Area',
      type: 'Part-time',
      wage: '₹400/day',
      description: 'Package delivery. Bicycle provided. Flexible hours.',
      createdAt: new Date().toISOString(),
    },
  ]
  localStorage.setItem('mock_jobs', JSON.stringify(defaults))
  return defaults
}

export const resourceHandlers = [
  // SHELTERS
  http.get('/api/shelters', async () => {
    await new Promise((resolve) => setTimeout(resolve, 700))
    return HttpResponse.json(getStoredShelters())
  }),

  http.post('/api/shelters', async ({ request }) => {
    const body = await request.json() as Omit<Shelter, 'id'>
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Validate occupied <= capacity
    if (body.occupied > body.capacity) {
      return HttpResponse.json(
        { message: 'Occupied count cannot exceed capacity' },
        { status: 400 }
      )
    }

    const shelters = getStoredShelters()
    const newShelter: Shelter = {
      ...body,
      id: `s${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    shelters.push(newShelter)
    localStorage.setItem('mock_shelters', JSON.stringify(shelters))
    return HttpResponse.json(newShelter)
  }),

  http.put('/api/shelters/:id', async ({ request, params }) => {
    const { id } = params
    const body = await request.json() as Partial<Shelter>
    await new Promise((resolve) => setTimeout(resolve, 600))

    const shelters = getStoredShelters()
    const index = shelters.findIndex((s) => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json({ message: 'Shelter not found' }, { status: 404 })
    }

    const updated = { ...shelters[index], ...body }

    // Validate occupied <= capacity
    if (updated.occupied > updated.capacity) {
      return HttpResponse.json(
        { message: 'Occupied count cannot exceed capacity' },
        { status: 400 }
      )
    }

    shelters[index] = updated
    localStorage.setItem('mock_shelters', JSON.stringify(shelters))
    return HttpResponse.json(updated)
  }),

  http.delete('/api/shelters/:id', async ({ params }) => {
    const { id } = params
    await new Promise((resolve) => setTimeout(resolve, 500))

    const shelters = getStoredShelters()
    const filtered = shelters.filter((s) => s.id !== id)
    localStorage.setItem('mock_shelters', JSON.stringify(filtered))
    return HttpResponse.json({ success: true })
  }),

  // JOBS
  http.get('/api/jobs', async () => {
    await new Promise((resolve) => setTimeout(resolve, 700))
    return HttpResponse.json(getStoredJobs())
  }),

  http.post('/api/jobs', async ({ request }) => {
    const body = await request.json() as Omit<Job, 'id'>
    await new Promise((resolve) => setTimeout(resolve, 600))

    const jobs = getStoredJobs()
    const newJob: Job = {
      ...body,
      id: `j${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    jobs.push(newJob)
    localStorage.setItem('mock_jobs', JSON.stringify(jobs))
    return HttpResponse.json(newJob)
  }),

  http.put('/api/jobs/:id', async ({ request, params }) => {
    const { id } = params
    const body = await request.json() as Partial<Job>
    await new Promise((resolve) => setTimeout(resolve, 600))

    const jobs = getStoredJobs()
    const index = jobs.findIndex((j) => j.id === id)
    
    if (index === -1) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 })
    }

    jobs[index] = { ...jobs[index], ...body }
    localStorage.setItem('mock_jobs', JSON.stringify(jobs))
    return HttpResponse.json(jobs[index])
  }),

  http.delete('/api/jobs/:id', async ({ params }) => {
    const { id } = params
    await new Promise((resolve) => setTimeout(resolve, 500))

    const jobs = getStoredJobs()
    const filtered = jobs.filter((j) => j.id !== id)
    localStorage.setItem('mock_jobs', JSON.stringify(filtered))
    return HttpResponse.json({ success: true })
  }),

  // REQUESTS (for volunteers)
  http.post('/api/requests', async ({ request }) => {
    const body = await request.json()
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    console.log('Request received:', body)
    return HttpResponse.json({ success: true, message: 'Request sent successfully' })
  }),
]
