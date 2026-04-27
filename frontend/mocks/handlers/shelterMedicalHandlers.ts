import { http, HttpResponse } from 'msw'
import { MedicalRecord, MedicalFollowup } from '@/lib/types'

// LocalStorage keys
const RECORDS_KEY = 'mock_shelter_medical_records'
const FOLLOWUPS_KEY = 'mock_shelter_medical_followups'

// Initialize data
function getRecords(): MedicalRecord[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(RECORDS_KEY)
  if (stored) return JSON.parse(stored)
  
  // Initial sample data
  const initial: MedicalRecord[] = [
    {
      id: 'med1',
      residentId: 'res1',
      residentName: 'Vikram Singh',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      diagnosis: 'Type 2 Diabetes',
      doctor: 'Dr. Sarah Johnson',
      notes: 'Blood sugar levels stable. Continue current insulin regimen. Monitor daily.',
      followUpDate: undefined,
    },
    {
      id: 'med2',
      residentId: 'res1',
      residentName: 'Vikram Singh',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      diagnosis: 'Hypertension',
      doctor: 'Dr. Sarah Johnson',
      notes: 'Blood pressure elevated. Prescribed medication and dietary changes.',
      followUpDate: undefined,
    },
    {
      id: 'med3',
      residentId: 'res2',
      residentName: 'Lakshmi Nair',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      diagnosis: 'Arthritis',
      doctor: 'Dr. Michael Chen',
      notes: 'Joint pain in knees and hands. Prescribed anti-inflammatory medication.',
      followUpDate: undefined,
    },
    {
      id: 'med4',
      residentId: 'res3',
      residentName: 'Ravi Verma',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      diagnosis: 'Annual Health Checkup',
      doctor: 'Dr. Lisa Patel',
      notes: 'Overall health good. Recommended regular exercise and balanced diet.',
      followUpDate: undefined,
    },
  ]
  
  localStorage.setItem(RECORDS_KEY, JSON.stringify(initial))
  return initial
}

function getFollowups(): MedicalFollowup[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(FOLLOWUPS_KEY)
  if (stored) return JSON.parse(stored)
  
  // Initial sample data
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  const initial: MedicalFollowup[] = [
    {
      id: 'fu1',
      recordId: 'med1',
      residentId: 'res1',
      residentName: 'Vikram Singh',
      shelterId: 'S001',
      date: today.toISOString().split('T')[0],
      notes: 'Diabetes check-up - Blood sugar monitoring',
      completed: false,
    },
    {
      id: 'fu2',
      recordId: 'med3',
      residentId: 'res2',
      residentName: 'Lakshmi Nair',
      shelterId: 'S001',
      date: nextWeek.toISOString().split('T')[0],
      notes: 'Arthritis follow-up - Check medication effectiveness',
      completed: false,
    },
  ]
  
  localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(initial))
  return initial
}

function saveRecords(records: MedicalRecord[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
  }
}

function saveFollowups(followups: MedicalFollowup[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(followups))
  }
}

export const shelterMedicalHandlers = [
  // GET medical records
  http.get('/api/shelter/medical', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    const url = new URL(request.url)
    const residentId = url.searchParams.get('residentId')
    
    let records = getRecords()
    
    if (residentId) {
      records = records.filter((r) => r.residentId === residentId)
    }
    
    // Sort by date descending
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return HttpResponse.json(records)
  }),

  // POST create medical record
  http.post('/api/shelter/medical', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 700))
    
    const body = (await request.json()) as Partial<MedicalRecord>
    const records = getRecords()
    const followups = getFollowups()
    
    const newRecord: MedicalRecord = {
      id: `med${Date.now()}`,
      residentId: body.residentId!,
      residentName: body.residentName!,
      date: body.date || new Date().toISOString(),
      diagnosis: body.diagnosis!,
      doctor: body.doctor,
      notes: body.notes,
      followUpDate: body.followUpDate,
    }
    
    records.push(newRecord)
    saveRecords(records)
    
    // If followUpDate is provided, create a followup
    if (newRecord.followUpDate) {
      const newFollowup: MedicalFollowup = {
        id: `fu${Date.now()}`,
        recordId: newRecord.id,
        residentId: newRecord.residentId,
        residentName: newRecord.residentName,
        shelterId: 'S001', // Default shelter ID for mock data
        date: newRecord.followUpDate,
        notes: `Follow-up for: ${newRecord.diagnosis}`,
        completed: false,
      }
      followups.push(newFollowup)
      saveFollowups(followups)
    }
    
    return HttpResponse.json(newRecord)
  }),

  // POST schedule followup
  http.post('/api/shelter/medical/:recordId/followups', async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const { recordId } = params
    const body = (await request.json()) as any
    const followups = getFollowups()
    const records = getRecords()
    
    const record = records.find((r) => r.id === recordId)
    
    const newFollowup: MedicalFollowup = {
      id: `fu${Date.now()}`,
      recordId: recordId as string,
      residentId: body.residentId,
      residentName: record?.residentName || body.residentName,
      shelterId: body.shelterId || 'S001',
      date: body.date,
      notes: body.notes,
      completed: false,
    }
    
    followups.push(newFollowup)
    saveFollowups(followups)
    
    return HttpResponse.json(newFollowup)
  }),

  // GET followups
  http.get('/api/shelter/medical/followups', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const url = new URL(request.url)
    const dateFilter = url.searchParams.get('date')
    const shelterId = url.searchParams.get('shelterId')
    
    let followups = getFollowups()
    
    if (shelterId) {
      followups = followups.filter((f) => f.shelterId === shelterId)
    }
    
    if (dateFilter) {
      followups = followups.filter((f) => f.date === dateFilter)
    }
    
    // Sort by date ascending
    followups.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    return HttpResponse.json(followups)
  }),

  // POST create followup
  http.post('/api/shelter/medical/followups', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const body = (await request.json()) as any
    const followups = getFollowups()
    
    const newFollowup: MedicalFollowup = {
      id: `fu${Date.now()}`,
      recordId: body.recordId,
      residentId: body.residentId,
      residentName: body.residentName,
      shelterId: body.shelterId,
      date: body.date,
      notes: body.notes,
      completed: false,
    }
    
    followups.push(newFollowup)
    saveFollowups(followups)
    
    return HttpResponse.json(newFollowup)
  }),

  // POST mark followup complete
  http.post('/api/shelter/medical/followups/:id/complete', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    const { id } = params
    const followups = getFollowups()
    
    const index = followups.findIndex((f) => f.id === id)
    if (index !== -1) {
      followups[index].completed = true
      saveFollowups(followups)
      return HttpResponse.json(followups[index])
    }
    
    return HttpResponse.json({ error: 'Followup not found' }, { status: 404 })
  }),

  // PATCH toggle followup complete
  http.patch('/api/shelter/medical/followups/:id', async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    const { id } = params
    const body = (await request.json()) as any
    const followups = getFollowups()
    
    const index = followups.findIndex((f) => f.id === id)
    if (index !== -1) {
      followups[index].completed = body.completed
      saveFollowups(followups)
      return HttpResponse.json(followups[index])
    }
    
    return HttpResponse.json({ error: 'Followup not found' }, { status: 404 })
  }),
]
