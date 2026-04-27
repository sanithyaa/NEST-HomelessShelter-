import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json([
    {
      id: 'res1',
      residentName: 'Vikram Singh',
      admittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'res2',
      residentName: 'Lakshmi Nair',
      admittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ])
}
