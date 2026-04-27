import { NextRequest, NextResponse } from 'next/server'

// In-memory storage (will reset on server restart)
// Export so it can be accessed by the complete route
export let followups = [
  {
    id: 'fu1',
    recordId: 'med1',
    residentId: 'res1',
    residentName: 'Vikram Singh',
    shelterId: 'S001',
    date: new Date().toISOString().split('T')[0],
    notes: 'Diabetes check-up - Blood sugar monitoring',
    completed: false,
  },
  {
    id: 'fu2',
    recordId: 'med3',
    residentId: 'res2',
    residentName: 'Lakshmi Nair',
    shelterId: 'S001',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Arthritis follow-up - Check medication effectiveness',
    completed: false,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shelterId = searchParams.get('shelterId')
  const dateFilter = searchParams.get('date')

  let filtered = [...followups]

  if (shelterId) {
    filtered = filtered.filter((f) => f.shelterId === shelterId)
  }

  if (dateFilter) {
    filtered = filtered.filter((f) => f.date === dateFilter)
  }

  // Sort by date ascending
  filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  console.log('[API] Returning', filtered.length, 'follow-ups')

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newFollowup = {
      id: `fu${Date.now()}`,
      recordId: body.recordId,
      residentId: body.residentId,
      residentName: body.residentName,
      shelterId: body.shelterId,
      date: body.date,
      notes: body.notes || '',
      completed: false,
    }

    followups.push(newFollowup)

    console.log('[API] Follow-up created:', newFollowup.id)

    return NextResponse.json(newFollowup, { status: 201 })
  } catch (error) {
    console.error('[API] Error creating follow-up:', error)
    return NextResponse.json(
      { error: 'Failed to create follow-up' },
      { status: 500 }
    )
  }
}
