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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shelterId = searchParams.get('shelterId')

  let filtered = [...residents]
  if (shelterId) {
    filtered = filtered.filter((r) => r.shelterId === shelterId)
  }

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('[API] POST /api/shelter/residents - Received body:', body)

    // Validate required fields
    if (!body.name || !body.age || !body.gender) {
      console.error('[API] Missing required fields:', { name: body.name, age: body.age, gender: body.gender })
      return NextResponse.json(
        { error: 'Missing required fields: name, age, gender' },
        { status: 400 }
      )
    }

    // Generate bed number
    const bedNumber = `B${Math.floor(Math.random() * 50) + 1}`

    const newResident = {
      id: `res${Date.now()}`,
      shelterId: body.shelterId || 'S001',
      name: body.name,
      age: body.age,
      gender: body.gender,
      admittedAt: new Date().toISOString(),
      bedNumber,
      notes: body.notes || 'Walk-in admission',
      health: body.health || 'To be assessed',
      skills: body.skills || 'To be determined',
      needs: body.needs || 'General support',
      photo: body.photo || null,
    }

    residents.push(newResident)

    console.log('[API] ✅ Resident created successfully:', newResident.id, newResident.name)

    return NextResponse.json(newResident, { status: 201 })
  } catch (error) {
    console.error('[API] ❌ Error creating resident:', error)
    return NextResponse.json(
      { error: 'Failed to create resident', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
