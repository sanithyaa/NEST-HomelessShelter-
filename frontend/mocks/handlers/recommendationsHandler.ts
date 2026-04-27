import { http, HttpResponse } from 'msw'

export const recommendationsHandlers = [
  http.get('/api/recommendations', async ({ request }) => {
    const url = new URL(request.url)
    const profileId = url.searchParams.get('profileId')

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const recommendations = [
      {
        id: 'r1',
        type: 'Shelter',
        name: 'Safe Haven Home',
        score: 92,
        reasons: ['Close to location', 'Medical support available', 'High availability'],
        contact: '+91 98765 43210',
        address: '123 Main Street, Kochi',
      },
      {
        id: 'r2',
        type: 'Job',
        name: 'Street Cleaner - CityWorks',
        score: 78,
        reasons: ['Part-time position', 'Near current area', 'Training provided'],
        contact: 'hr@cityworks.com',
        address: 'Municipal Office, Kochi',
      },
      {
        id: 'r3',
        type: 'Medical',
        name: 'Community Health Clinic',
        score: 85,
        reasons: ['Free checkups', 'Rehabilitation support', 'Mental health services'],
        contact: '+91 98765 11111',
        address: '456 Health Road, Kochi',
      },
      {
        id: 'r4',
        type: 'Training',
        name: 'Skill Development Center',
        score: 73,
        reasons: ['Free courses', 'Job placement assistance', 'Flexible timings'],
        contact: 'info@skillcenter.org',
        address: '789 Education Lane, Kochi',
      },
    ]

    return HttpResponse.json(recommendations)
  }),
]
