import { http, HttpResponse } from 'msw';
import { AnalyticsOverview } from '@/lib/analytics';

// Initialize or get stored analytics data
function getStoredAnalytics(): AnalyticsOverview {
  if (typeof window === 'undefined') return generateDefaultAnalytics(30);
  
  const stored = localStorage.getItem('mock_analytics');
  if (stored) return JSON.parse(stored);
  
  const defaults = generateDefaultAnalytics(30);
  localStorage.setItem('mock_analytics', JSON.stringify(defaults));
  return defaults;
}

// Generate realistic analytics data
function generateDefaultAnalytics(days: number): AnalyticsOverview {
  const dailyProfiles = [];
  const dailyAssignments = [];
  
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate realistic patterns
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseProfiles = isWeekend ? 2 : 5;
    const baseAssignments = isWeekend ? 3 : 8;
    
    // Add some randomness
    const profileCount = baseProfiles + Math.floor(Math.random() * 4);
    const assignmentCount = baseAssignments + Math.floor(Math.random() * 6);
    
    dailyProfiles.push({ date: dateStr, count: profileCount });
    dailyAssignments.push({ date: dateStr, count: assignmentCount });
  }
  
  // Calculate totals
  const totalProfiles = dailyProfiles.reduce((sum, d) => sum + d.count, 0);
  const totalAssignments = dailyAssignments.reduce((sum, d) => sum + d.count, 0);
  
  return {
    totals: {
      profiles: totalProfiles + 45, // Add base count
      shelters: 5,
      jobs: 6,
      matches: 3,
      assignmentsToday: dailyAssignments[dailyAssignments.length - 1]?.count || 0,
    },
    timeseries: {
      dailyProfiles,
      dailyAssignments,
    },
  };
}

export const analyticsHandlers = [
  http.get('/api/analytics/overview', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30', 10);
    
    const analytics = getStoredAnalytics();
    
    // Filter timeseries based on days parameter
    const filteredAnalytics = {
      ...analytics,
      timeseries: {
        dailyProfiles: analytics.timeseries.dailyProfiles.slice(-days),
        dailyAssignments: analytics.timeseries.dailyAssignments.slice(-days),
      },
    };
    
    return HttpResponse.json(filteredAnalytics);
  }),
];
