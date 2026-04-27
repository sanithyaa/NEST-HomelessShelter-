import { http, HttpResponse } from 'msw'

// Initialize storage
function getStoredMatches() {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_matches')
  if (stored) return JSON.parse(stored)
  
  // Default matches
  const defaults = [
    {
      id: 'm1',
      profileId: 'p1',
      profileName: 'Ravi Kumar',
      age: 35,
      priority: 'High',
      recommendations: [
        { type: 'Shelter', name: 'Safe Haven Home', score: 92, reason: 'Close proximity, medical support' },
        { type: 'Job', name: 'City Cleaner', score: 78, reason: 'Part-time, training provided' },
        { type: 'Medical', name: 'Free Clinic', score: 85, reason: 'Diabetes care available' },
      ],
    },
    {
      id: 'm2',
      profileId: 'p2',
      profileName: 'Lata Devi',
      age: 42,
      priority: 'Critical',
      recommendations: [
        { type: 'Shelter', name: 'Hope House', score: 88, reason: 'Family-friendly, immediate availability' },
        { type: 'Medical', name: 'Community Health Center', score: 95, reason: 'Mental health support' },
        { type: 'Job', name: 'Kitchen Helper', score: 72, reason: 'Flexible hours, meals included' },
      ],
    },
    {
      id: 'm3',
      profileId: 'p3',
      profileName: 'Suresh Babu',
      age: 28,
      priority: 'Medium',
      recommendations: [
        { type: 'Job', name: 'Warehouse Assistant', score: 85, reason: 'Full-time, good pay' },
        { type: 'Shelter', name: 'Community Care Center', score: 65, reason: 'Currently limited space' },
        { type: 'Training', name: 'Skill Development Center', score: 80, reason: 'Job placement assistance' },
      ],
    },
  ]
  localStorage.setItem('mock_matches', JSON.stringify(defaults))
  return defaults
}

function getStoredAssignments() {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_assignments')
  return stored ? JSON.parse(stored) : []
}

function saveAssignment(assignment: any) {
  if (typeof window === 'undefined') return
  const assignments = getStoredAssignments()
  assignments.push(assignment)
  localStorage.setItem('mock_assignments', JSON.stringify(assignments))
}

export const matchesHandlers = [
  // GET all matches
  http.get('/api/matches', async () => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return HttpResponse.json(getStoredMatches())
  }),

  // POST assign match
  http.post('/api/matches/assign', async ({ request }) => {
    const body = await request.json() as any
    await new Promise((resolve) => setTimeout(resolve, 700))

    // Create assignment record
    const assignment = {
      id: `a${Date.now()}`,
      profileId: body.profileId,
      type: body.type,
      name: body.name,
      assignedAt: new Date().toISOString(),
      assignedBy: 'Current User',
    }
    saveAssignment(assignment)

    // Create follow-up record
    const followup = {
      id: `f${Date.now()}`,
      profileId: body.profileId,
      type: 'Assigned',
      note: `Assigned to ${body.type}: ${body.name}`,
      date: new Date().toISOString(),
      completed: false,
      createdBy: 'System',
    }

    // Save to followups
    const followups = JSON.parse(localStorage.getItem('followups') || '[]')
    followups.push(followup)
    localStorage.setItem('followups', JSON.stringify(followups))

    return HttpResponse.json({
      success: true,
      assignment,
      followup,
    })
  }),

  // GET assignment stats
  http.get('/api/matches/stats', async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const assignments = getStoredAssignments()
    const today = new Date().toISOString().split('T')[0]
    const todayAssignments = assignments.filter((a: any) => 
      a.assignedAt.startsWith(today)
    )

    // Count by type
    const typeCounts: Record<string, number> = {}
    assignments.forEach((a: any) => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1
    })

    const topCategory = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]

    return HttpResponse.json({
      totalMatches: getStoredMatches().length,
      totalAssignments: assignments.length,
      assignmentsToday: todayAssignments.length,
      topCategory: topCategory ? topCategory[0] : 'None',
      topCategoryCount: topCategory ? topCategory[1] : 0,
    })
  }),
]
