import { http, HttpResponse } from 'msw'

// Storage functions
function getShelterResidents() {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_shelter_residents')
  if (stored) return JSON.parse(stored)

  // Seed default data
  const defaults = [
    {
      id: 'res1',
      shelterId: 'S001',
      name: 'Vikram Singh',
      age: 42,
      gender: 'Male',
      admittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      bedNumber: 'B12',
      notes: 'Admitted from NGO request. Requires regular medication for diabetes.',
      health: 'Diabetes, requires insulin twice daily',
      skills: 'Carpentry, basic electrical work',
      needs: 'Medical care, stable housing',
      ngoProfileId: 'p101',
    },
    {
      id: 'res2',
      shelterId: 'S001',
      name: 'Lakshmi Nair',
      age: 55,
      gender: 'Female',
      admittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      bedNumber: 'A07',
      notes: 'Walk-in admission. Elderly, needs assistance with mobility.',
      health: 'Arthritis, high blood pressure',
      skills: 'Cooking, tailoring',
      needs: 'Medical checkup, warm shelter',
    },
    {
      id: 'res3',
      shelterId: 'S001',
      name: 'Ravi Verma',
      age: 38,
      gender: 'Male',
      admittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      bedNumber: 'C05',
      notes: 'Recently lost job, actively seeking employment.',
      health: 'Good health',
      skills: 'Driving, warehouse management',
      needs: 'Job assistance, resume building',
    },
  ]

  localStorage.setItem('mock_shelter_residents', JSON.stringify(defaults))
  return defaults
}

function saveShelterResidents(residents: any[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('mock_shelter_residents', JSON.stringify(residents))
}

function getDailyLogs() {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_shelter_daily_logs')
  if (stored) return JSON.parse(stored)

  // Seed default logs
  const defaults = [
    {
      id: 'log1',
      residentId: 'res1',
      shelterId: 'S001',
      note: 'Morning medication administered. Blood sugar levels normal.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Nurse Sarah',
    },
    {
      id: 'log2',
      residentId: 'res1',
      shelterId: 'S001',
      note: 'Attended job training session. Showed good progress in carpentry skills.',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Staff John',
    },
    {
      id: 'log3',
      residentId: 'res2',
      shelterId: 'S001',
      note: 'Blood pressure check completed. Readings within normal range.',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Nurse Sarah',
    },
    {
      id: 'log4',
      residentId: 'res2',
      shelterId: 'S001',
      note: 'Participated in cooking class. Prepared lunch for other residents.',
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Staff Maria',
    },
    {
      id: 'log5',
      residentId: 'res3',
      shelterId: 'S001',
      note: 'Job interview scheduled for tomorrow at 10 AM. Resume updated.',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Staff John',
    },
  ]

  localStorage.setItem('mock_shelter_daily_logs', JSON.stringify(defaults))
  return defaults
}

function saveDailyLogs(logs: any[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('mock_shelter_daily_logs', JSON.stringify(logs))
}

// Helper function to update bed occupancy
function updateBedOccupancy(shelterId: string, delta: number) {
  if (typeof window === 'undefined') return
  
  const statsKey = 'mock_shelter_bed_stats'
  const stored = localStorage.getItem(statsKey)
  const stats = stored ? JSON.parse(stored) : {}
  
  if (!stats[shelterId]) {
    stats[shelterId] = { totalBeds: 50, occupiedBeds: 0, availableBeds: 50 }
  }
  
  stats[shelterId].occupiedBeds += delta
  stats[shelterId].availableBeds = stats[shelterId].totalBeds - stats[shelterId].occupiedBeds
  
  localStorage.setItem(statsKey, JSON.stringify(stats))
}

export const shelterResidentsHandlers = [
  // GET all residents (filtered by shelterId)
  http.get('/api/shelter/residents', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 500))

    const url = new URL(request.url)
    const shelterId = url.searchParams.get('shelterId')

    const allResidents = getShelterResidents()
    
    if (shelterId) {
      const filtered = allResidents.filter((r: any) => r.shelterId === shelterId)
      return HttpResponse.json(filtered)
    }

    return HttpResponse.json(allResidents)
  }),

  // GET single resident by ID
  http.get('/api/shelter/residents/:id', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 500))

    const { id } = params
    const residents = getShelterResidents()
    const resident = residents.find((r: any) => r.id === id)

    if (!resident) {
      return HttpResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    return HttpResponse.json(resident)
  }),

  // POST create new resident
  http.post('/api/shelter/residents', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    const body = (await request.json()) as any
    const residents = getShelterResidents()

    const newResident = {
      id: `res${Date.now()}`,
      ...body,
      admittedAt: body.admittedAt || new Date().toISOString(),
    }

    residents.push(newResident)
    saveShelterResidents(residents)

    return HttpResponse.json(newResident)
  }),

  // POST create walk-in resident
  http.post('/api/shelter/residents/walkin', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    const body = (await request.json()) as any
    const { name, age, gender, shelterId, photo, notes } = body

    // Get existing residents
    const residents = getShelterResidents()

    // Create new walk-in resident
    const newResident = {
      id: crypto.randomUUID(),
      shelterId,
      name,
      age,
      gender,
      admittedAt: new Date().toISOString(),
      bedNumber: null,  // Assigned later
      photo: photo || null,
      notes: notes || null,
    }

    // Append and save
    residents.push(newResident)
    saveShelterResidents(residents)

    // Update bed occupancy stats
    updateBedOccupancy(shelterId, 1)

    return HttpResponse.json({
      success: true,
      ...newResident,
    })
  }),

  // PUT update resident
  http.put('/api/shelter/residents/:id', async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    const { id } = params
    const body = (await request.json()) as any
    const residents = getShelterResidents()
    const index = residents.findIndex((r: any) => r.id === id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    residents[index] = { ...residents[index], ...body }
    saveShelterResidents(residents)

    return HttpResponse.json(residents[index])
  }),

  // DELETE resident (discharge)
  http.delete('/api/shelter/residents/:id', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    const { id } = params
    const residents = getShelterResidents()
    const filtered = residents.filter((r: any) => r.id !== id)

    saveShelterResidents(filtered)

    return HttpResponse.json({ success: true, message: 'Resident discharged successfully' })
  }),

  // POST discharge resident
  http.post('/api/shelter/residents/:id/discharge', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    const { id } = params
    const residents = getShelterResidents()
    const resident = residents.find((r: any) => r.id === id)

    if (!resident) {
      return HttpResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    // Remove from residents list
    const filtered = residents.filter((r: any) => r.id !== id)
    saveShelterResidents(filtered)

    // Log discharge
    if (typeof window !== 'undefined') {
      const dischargeLogs = localStorage.getItem('mock_shelter_discharge_logs')
      const logs = dischargeLogs ? JSON.parse(dischargeLogs) : []
      logs.push({
        id: `dis${Date.now()}`,
        residentId: id,
        residentName: resident.name,
        shelterId: resident.shelterId,
        dischargedAt: new Date().toISOString(),
      })
      localStorage.setItem('mock_shelter_discharge_logs', JSON.stringify(logs))
    }

    return HttpResponse.json({
      success: true,
      message: `${resident.name} has been discharged successfully`,
    })
  }),

  // GET daily logs for a resident
  http.get('/api/shelter/residents/:id/logs', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 500))

    const { id } = params
    const allLogs = getDailyLogs()
    const residentLogs = allLogs
      .filter((log: any) => log.residentId === id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return HttpResponse.json(residentLogs)
  }),

  // POST create daily log
  http.post('/api/shelter/residents/:id/logs', async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    const { id } = params
    const body = (await request.json()) as any
    const logs = getDailyLogs()

    const newLog = {
      id: `log${Date.now()}`,
      residentId: id,
      ...body,
      createdAt: new Date().toISOString(),
    }

    logs.push(newLog)
    saveDailyLogs(logs)

    return HttpResponse.json(newLog)
  }),
]
