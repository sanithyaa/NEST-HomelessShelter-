import { NextRequest, NextResponse } from 'next/server'

// Use a global variable to persist data during dev server runtime
// In production, this would be a database
let medicalRecords = [
  {
    id: 'med1',
    residentId: 'res1',
    residentName: 'Vikram Singh',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    diagnosis: 'Type 2 Diabetes',
    doctor: 'Dr. Sarah Johnson',
    notes: 'Blood sugar levels stable. Continue current insulin regimen. Monitor daily.',
  },
  {
    id: 'med2',
    residentId: 'res1',
    residentName: 'Vikram Singh',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    diagnosis: 'Hypertension',
    doctor: 'Dr. Sarah Johnson',
    notes: 'Blood pressure elevated. Prescribed medication and dietary changes.',
  },
  {
    id: 'med3',
    residentId: 'res2',
    residentName: 'Lakshmi Nair',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    diagnosis: 'Arthritis',
    doctor: 'Dr. Michael Chen',
    notes: 'Joint pain in knees and hands. Prescribed anti-inflammatory medication.',
  },
  {
    id: 'med4',
    residentId: 'res3',
    residentName: 'Ravi Verma',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    diagnosis: 'Annual Health Checkup',
    doctor: 'Dr. Lisa Patel',
    notes: 'Overall health good. Recommended regular exercise and balanced diet.',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const residentId = searchParams.get('residentId')

  let filtered = [...medicalRecords]

  if (residentId) {
    filtered = filtered.filter((r) => r.residentId === residentId)
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newRecord = {
      id: `med${Date.now()}`,
      residentId: body.residentId,
      residentName: body.residentName,
      date: body.date || new Date().toISOString(),
      diagnosis: body.diagnosis,
      doctor: body.doctor,
      notes: body.notes,
      followUpDate: body.followUpDate || null,
    }

    medicalRecords.push(newRecord)

    console.log('[API] Medical record created:', newRecord.id)

    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    console.error('[API] Error creating medical record:', error)
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    )
  }
}
