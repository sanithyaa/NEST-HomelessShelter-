import { NextRequest, NextResponse } from 'next/server'

// Mock data
const residents = [
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const resident = residents.find((r) => r.id === id)

  if (!resident) {
    return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
  }

  return NextResponse.json(resident)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const index = residents.findIndex((r) => r.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    // Update resident with new data
    residents[index] = {
      ...residents[index],
      ...body,
    }

    console.log('[API] Resident updated:', residents[index].id, residents[index].name)

    return NextResponse.json(residents[index])
  } catch (error) {
    console.error('[API] Error updating resident:', error)
    return NextResponse.json(
      { error: 'Failed to update resident' },
      { status: 500 }
    )
  }
}
