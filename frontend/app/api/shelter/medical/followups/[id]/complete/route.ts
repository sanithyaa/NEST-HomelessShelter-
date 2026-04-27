import { NextRequest, NextResponse } from 'next/server'

// Import the followups array from the parent route
// In production, this would be a database
import { followups } from '../../route'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('[API] Marking follow-up complete:', id)

    // Find and update the followup
    const followup = followups.find((f: any) => f.id === id)

    if (!followup) {
      console.error('[API] Follow-up not found:', id)
      return NextResponse.json(
        { error: 'Follow-up not found' },
        { status: 404 }
      )
    }

    followup.completed = true
    followup.completedAt = new Date().toISOString()

    console.log('[API] Follow-up marked complete:', followup)

    return NextResponse.json(followup, { status: 200 })
  } catch (error) {
    console.error('[API] Error marking follow-up complete:', error)
    return NextResponse.json(
      { error: 'Failed to mark follow-up complete' },
      { status: 500 }
    )
  }
}
