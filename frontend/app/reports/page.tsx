'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ReportsHeader } from '@/components/Reports/ReportsHeader';
import { ChartsPanel } from '@/components/Reports/ChartsPanel';
import { ExportControls } from '@/components/Reports/ExportControls';
import { getAnalyticsOverview } from '@/lib/analytics';
import { TrendingUp, Users, Building2, Briefcase, Target } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (!session) {
      router.push('/auth/login');
      return;
    }

    const user = JSON.parse(session);
    if (user.role !== 'ngo' && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setMounted(true);
  }, [router]);

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => getAnalyticsOverview(dateRange),
    enabled: mounted,
  });

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-brown-600 dark:text-brown-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-brown-600 dark:text-brown-400">Failed to load analytics</p>
      </div>
    );
  }

  const statCards = [
    {
      label: t('reports.total_profiles'),
      value: analytics.totals.profiles,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: t('reports.total_shelters'),
      value: analytics.totals.shelters,
      icon: Building2,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    },
    {
      label: t('reports.total_jobs'),
      value: analytics.totals.jobs,
      icon: Briefcase,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: t('reports.total_matches'),
      value: analytics.totals.matches,
      icon: Target,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: t('reports.assignments_today'),
      value: analytics.totals.assignmentsToday,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ReportsHeader dateRange={dateRange} onDateRangeChange={setDateRange} />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-brown-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-brown-900 dark:text-cream-50 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-brown-600 dark:text-brown-400">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts and Export Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartsPanel
              dailyProfiles={analytics.timeseries.dailyProfiles}
              dailyAssignments={analytics.timeseries.dailyAssignments}
            />
          </div>
          <div>
            <ExportControls
              analytics={analytics}
              dateRange={dateRange}
              onSyncComplete={() => refetch()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
