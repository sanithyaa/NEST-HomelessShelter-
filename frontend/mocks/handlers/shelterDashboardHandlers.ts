import { http, HttpResponse } from 'msw'

// Mock data storage
function getShelterDashboardData() {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('mock_shelter_dashboard_data')
  if (stored) return JSON.parse(stored)

  // Seed default data
  const defaults = {
    bedStats: {
      S001: { shelterId: 'S001', totalBeds: 50, occupiedBeds: 42, availableBeds: 8 },
      S002: { shelterId: 'S002', totalBeds: 30, occupiedBeds: 15, availableBeds: 15 },
    },
    pendingRequests: {
      S001: [
        {
          id: 'req1',
          residentName: 'Rajesh Kumar',
          priority: 'High' as const,
          requestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'req2',
          residentName: 'Priya Sharma',
          priority: 'Medium' as const,
          requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'req3',
          residentName: 'Amit Patel',
          priority: 'Low' as const,
          requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      S002: [
        {
          id: 'req4',
          residentName: 'Sunita Devi',
          priority: 'High' as const,
          requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    recentAdmissions: {
      S001: [
        {
          id: 'adm1',
          residentName: 'Vikram Singh',
          admittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'adm2',
          residentName: 'Lakshmi Nair',
          admittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'adm3',
          residentName: 'Ravi Verma',
          admittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'adm4',
          residentName: 'Meena Gupta',
          admittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'adm5',
          residentName: 'Suresh Reddy',
          admittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      S002: [
        {
          id: 'adm6',
          residentName: 'Anjali Desai',
          admittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'adm7',
          residentName: 'Kiran Joshi',
          admittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    upcomingDischarges: {
      S001: [
        {
          id: 'dis1',
          residentName: 'Ramesh Iyer',
          dischargeDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'dis2',
          residentName: 'Pooja Menon',
          dischargeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'dis3',
          residentName: 'Anil Kapoor',
          dischargeDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      S002: [
        {
          id: 'dis4',
          residentName: 'Deepa Rao',
          dischargeDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  }

  localStorage.setItem('mock_shelter_dashboard_data', JSON.stringify(defaults))
  return defaults
}

export const shelterDashboardHandlers = [
  // Bed Stats
  http.get('/api/shelter/dashboard/bed-stats', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 500))

    const url = new URL(request.url)
    const shelterId = url.searchParams.get('shelterId')

    if (!shelterId) {
      return HttpResponse.json({ error: 'shelterId required' }, { status: 400 })
    }

    // Calculate from actual residents
    const residentsData = localStorage.getItem('mock_shelter_residents')
    const residents = residentsData ? JSON.parse(residentsData) : []
    const shelterResidents = residents.filter((r: any) => r.shelterId === shelterId)
    
    const totalBeds = 50 // Fixed capacity
    const occupiedBeds = shelterResidents.length
    const availableBeds = totalBeds - occupiedBeds

    const stats = {
      shelterId,
      totalBeds,
      occupiedBeds,
      availableBeds,
    }

    return HttpResponse.json(stats)
  }),

  // Pending Requests
  http.get('/api/shelter/dashboard/pending-requests', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 500))

    const url = new URL(request.url)
    const shelterId = url.searchParams.get('shelterId')

    if (!shelterId) {
      return HttpResponse.json({ error: 'shelterId required' }, { status: 400 })
    }

    const data = getShelterDashboardData()
    const requests = data?.pendingRequests[shelterId] || []

    return HttpResponse.json(requests)
  }),

  // Recent Admissions
  http.get('/api/shelter/dashboard/recent-admissions', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 500))

    const url = new URL(request.url)
    const shelterId = url.searchParams.get('shelterId')

    if (!shelterId) {
      return HttpResponse.json({ error: 'shelterId required' }, { status: 400 })
    }

    const data = getShelterDashboardData()
    const admissions = data?.recentAdmissions[shelterId] || []

    return HttpResponse.json(admissions)
  }),

  // Upcoming Discharges
  http.get('/api/shelter/dashboard/upcoming-discharges', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 500))

    const url = new URL(request.url)
    const shelterId = url.searchParams.get('shelterId')

    if (!shelterId) {
      return HttpResponse.json({ error: 'shelterId required' }, { status: 400 })
    }

    // Get residents with scheduled discharge dates
    const residentsData = localStorage.getItem('mock_shelter_residents')
    const residents = residentsData ? JSON.parse(residentsData) : []
    
    const discharges = residents
      .filter((r: any) => r.shelterId === shelterId && r.scheduledDischargeDate)
      .map((r: any) => ({
        id: r.id,
        residentName: r.name,
        dischargeDate: r.scheduledDischargeDate,
      }))
      .sort((a: any, b: any) => new Date(a.dischargeDate).getTime() - new Date(b.dischargeDate).getTime())

    return HttpResponse.json(discharges)
  }),
]
