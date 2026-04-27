import { NextRequest, NextResponse } from 'next/server'

const requests = [
  {
    id: 'req1',
    shelterId: 'S001',
    residentName: 'Amit Kumar',
    age: 35,
    gender: 'Male',
    priority: 'High',
    reason: 'Urgent medical needs',
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'req2',
    shelterId: 'S001',
    residentName: 'Priya Sharma',
    age: 28,
    gender: 'Female',
    priority: 'Medium',
    reason: 'Lost housing',
    requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shelterId = searchParams.get('shelterId')

  let filtered = requests
  if (shelterId) {
    filtered = requests.filter((r) => r.shelterId === shelterId && r.status === 'pending')
  }

  return NextResponse.json(filtered)
}
