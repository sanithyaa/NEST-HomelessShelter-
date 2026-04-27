import { http, HttpResponse } from 'msw'

export const shelterHandlers = [
  // GET shelter stats
  http.get('/api/shelter/stats', () => {
    return HttpResponse.json({
      totalBeds: 120,
      bedsOccupied: 87,
      pendingRequests: 6,
      recentAdmissions: [
        { id: 1, name: 'Ravi Kumar', date: '2025-01-21' },
        { id: 2, name: 'Asha Devi', date: '2025-01-22' },
        { id: 3, name: 'Nadeem Ali', date: '2025-01-23' },
        { id: 4, name: 'Priya Sharma', date: '2025-01-24' },
        { id: 5, name: 'Mohammed Khan', date: '2025-01-25' },
      ],
      upcomingDischarges: [
        { id: 8, name: 'Sita Bala', dischargeDate: '2025-02-01' },
        { id: 10, name: 'Joseph Mathew', dischargeDate: '2025-02-04' },
      ],
    })
  }),
]
