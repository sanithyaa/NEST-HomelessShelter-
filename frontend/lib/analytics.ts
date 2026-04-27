// Analytics utilities
export interface TimeseriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AnalyticsOverview {
  totalProfiles: number;
  totalMatches: number;
  totalShelters: number;
  totalJobs: number;
  successRate: number;
  timeseries: TimeseriesDataPoint[];
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  // Mock data - replace with actual API call
  return {
    totalProfiles: 0,
    totalMatches: 0,
    totalShelters: 0,
    totalJobs: 0,
    successRate: 0,
    timeseries: [],
  };
}
