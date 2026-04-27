'use client';

import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';

interface ReportsHeaderProps {
  dateRange: 7 | 30 | 90;
  onDateRangeChange: (range: 7 | 30 | 90) => void;
}

export function ReportsHeader({ dateRange, onDateRangeChange }: ReportsHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-brown-900 dark:text-cream-50 mb-2">
        {t('reports.title')}
      </h1>
      <p className="text-brown-600 dark:text-brown-400 mb-6">
        {t('reports.overview')}
      </p>

      {/* Date Range Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-brown-600 dark:text-brown-400" />
        <span className="text-sm font-medium text-brown-700 dark:text-brown-300 mr-2">
          {t('reports.date_range')}:
        </span>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => onDateRangeChange(days as 7 | 30 | 90)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === days
                  ? 'bg-brown-600 text-white dark:bg-brown-500'
                  : 'bg-white dark:bg-gray-800 text-brown-700 dark:text-brown-300 border border-brown-200 dark:border-gray-700 hover:bg-brown-50 dark:hover:bg-gray-700'
              }`}
            >
              {t(`reports.last_${days}_days`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
