import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json([
    {
      id: 'req1',
      residentName: 'Amit Kumar',
      priority: 'High',
      requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'req2',
      residentName: 'Priya Sharma',
      priority: 'Medium',
      requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ])
}
