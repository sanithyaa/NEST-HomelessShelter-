import { http, HttpResponse } from 'msw'

// Storage functions
function getShelterRequests() {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_shelter_requests')
  if (stored) return JSON.parse(stored)

  // Seed default data
  const defaults = [
    {
      id: 'req1',
      shelterId: 'S001',
      ngoProfileId: 'p101',
      residentName: 'Rajesh Kumar',
      age: 42,
      gender: 'Male',
      reason: 'Needs immediate shelter due to medical emergency. Has diabetes and requires regular medication.',
      priority: 'High' as const,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      health: 'Requires regular medication for diabetes',
      skills: 'Carpentry, basic electrical work',
      needs: 'Medical care, stable housing',
    },
    {
      id: 'req2',
      shelterId: 'S001',
      ngoProfileId: 'p103',
      residentName: 'Priya Sharma',
      age: 29,
      gender: 'Female',
      reason: 'Recently lost job and housing. Seeking temporary shelter while looking for employment.',
      priority: 'Medium' as const,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      health: 'Good health',
      skills: 'Computer skills, data entry',
      needs: 'Short-term housing, job training',
    },
    {
      id: 'req3',
      shelterId: 'S001',
      ngoProfileId: 'p105',
      residentName: 'Amit Patel',
      age: 55,
      gender: 'Male',
      reason: 'Elderly person with mobility issues. Needs accessible shelter and medical care.',
      priority: 'Low' as const,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      health: 'Arthritis, needs warm shelter',
      skills: 'Retired teacher',
      needs: 'Accessible shelter, medical care',
    },
    {
      id: 'req4',
      shelterId: 'S002',
      ngoProfileId: 'p107',
      residentName: 'Sunita Devi',
      age: 38,
      gender: 'Female',
      reason: 'Domestic violence survivor. Needs safe shelter immediately.',
      priority: 'High' as const,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      health: 'Minor injuries, needs counseling',
      skills: 'Cooking, tailoring',
      needs: 'Safe shelter, counseling services',
    },
  ]

  localStorage.setItem('mock_shelter_requests', JSON.stringify(defaults))
  return defaults
}

function saveShelterRequests(requests: any[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('mock_shelter_requests', JSON.stringify(requests))
}

function getShelterResidents() {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_shelter_residents')
  return stored ? JSON.parse(stored) : []
}

function saveShelterResidents(residents: any[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('mock_shelter_residents', JSON.stringify(residents))
}

function getShelterRejections() {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_shelter_rejections')
  return stored ? JSON.parse(stored) : []
}

function saveShelterRejections(rejections: any[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('mock_shelter_rejections', JSON.stringify(rejections))
}

export const shelterRequestHandlers = [
  // GET all shelter requests (filtered by shelterId)
  http.get('/api/shelter/requests', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    const url = new URL(request.url)
    const shelterId = url.searchParams.get('shelterId')

    if (!shelterId) {
      return HttpResponse.json({ error: 'shelterId required' }, { status: 400 })
    }

    const allRequests = getShelterRequests()
    const filtered = allRequests.filter((req: any) => req.shelterId === shelterId)

    return HttpResponse.json(filtered)
  }),

  // POST accept request
  http.post('/api/shelter/requests/:id/accept', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400))

    const { id } = params
    const requests = getShelterRequests()
    const request = requests.find((req: any) => req.id === id)

    if (!request) {
      return HttpResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Remove from requests
    const updatedRequests = requests.filter((req: any) => req.id !== id)
    saveShelterRequests(updatedRequests)

    // Create resident from request
    const residents = getShelterResidents()
    const newResident = {
      id: `res${Date.now()}`,
      name: request.residentName,
      age: request.age,
      gender: request.gender,
      admissionDate: new Date().toISOString(),
      bedNumber: `B${residents.length + 1}`,
      notes: `Admitted from NGO request. Reason: ${request.reason}`,
      health: request.health,
      skills: request.skills,
      needs: request.needs,
      ngoProfileId: request.ngoProfileId,
      shelterId: request.shelterId,
    }

    residents.push(newResident)
    saveShelterResidents(residents)

    return HttpResponse.json({
      success: true,
      resident: newResident,
      message: `${request.residentName} has been admitted successfully`,
    })
  }),

  // POST reject request
  http.post('/api/shelter/requests/:id/reject', async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400))

    const { id } = params
    const body = await request.json() as { reason: string }

    const requests = getShelterRequests()
    const requestData = requests.find((req: any) => req.id === id)

    if (!requestData) {
      return HttpResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Remove from requests
    const updatedRequests = requests.filter((req: any) => req.id !== id)
    saveShelterRequests(updatedRequests)

    // Save rejection log
    const rejections = getShelterRejections()
    rejections.push({
      id: `rej${Date.now()}`,
      requestId: id,
      residentName: requestData.residentName,
      rejectedAt: new Date().toISOString(),
      reason: body.reason,
      shelterId: requestData.shelterId,
    })
    saveShelterRejections(rejections)

    return HttpResponse.json({
      success: true,
      message: `Request for ${requestData.residentName} has been rejected`,
    })
  }),
]
