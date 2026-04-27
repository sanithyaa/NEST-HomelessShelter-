import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json([
    {
      id: 'res3',
      residentName: 'Ravi Verma',
      dischargeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ])
}
