'use client';

import { useTranslation } from 'react-i18next';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { TimeseriesDataPoint } from '@/lib/analytics';
import { formatDate } from '@/lib/analytics';

interface ChartsPanelProps {
  dailyProfiles: TimeseriesDataPoint[];
  dailyAssignments: TimeseriesDataPoint[];
}

export function ChartsPanel({ dailyProfiles, dailyAssignments }: ChartsPanelProps) {
  const { t } = useTranslation();

  // Format data for charts
  const profilesData = dailyProfiles.map(d => ({
    date: formatDate(d.date),
    count: d.count,
  }));

  const assignmentsData = dailyAssignments.map(d => ({
    date: formatDate(d.date),
    count: d.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Profiles Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-brown-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-brown-900 dark:text-cream-50 mb-4">
          {t('reports.profiles_over_time')}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={profilesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#92400e"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#92400e"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #d4a574',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#d97706" 
              strokeWidth={2}
              dot={{ fill: '#d97706', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Assignments Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-brown-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-brown-900 dark:text-cream-50 mb-4">
          {t('reports.assignments_over_time')}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={assignmentsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#92400e"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#92400e"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #d4a574',
                borderRadius: '8px',
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#92400e"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
