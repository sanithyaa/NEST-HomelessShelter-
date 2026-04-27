'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { exportToCSV, AnalyticsOverview } from '@/lib/analytics';
import { syncPending, getPendingCount } from '@/lib/offline';

interface ExportControlsProps {
  analytics: AnalyticsOverview;
  dateRange: number;
  onSyncComplete?: () => void;
}

export function ExportControls({ analytics, dateRange, onSyncComplete }: ExportControlsProps) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Load pending count on mount
  useState(() => {
    getPendingCount().then(setPendingCount);
  });

  const handleExportCSV = () => {
    try {
      setExporting(true);
      
      // Combine profiles and assignments data
      const csvData = analytics.timeseries.dailyProfiles.map((profile, index) => ({
        date: profile.date,
        profiles: profile.count,
        assignments: analytics.timeseries.dailyAssignments[index]?.count || 0,
      }));

      exportToCSV(csvData, `nest-report-${dateRange}days-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('CSV export failed:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setExporting(true);
      toast.loading(t('reports.generating_pdf'));

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(146, 64, 14); // brown-800
      pdf.text('NEST Report', pageWidth / 2, 20, { align: 'center' });
      
      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(120, 113, 108);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
      pdf.text(`Period: Last ${dateRange} days`, pageWidth / 2, 34, { align: 'center' });
      
      // Add totals section
      pdf.setFontSize(14);
      pdf.setTextColor(146, 64, 14);
      pdf.text('Summary', 20, 50);
      
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      let yPos = 60;
      
      const totals = [
        { label: 'Total Profiles', value: analytics.totals.profiles },
        { label: 'Total Shelters', value: analytics.totals.shelters },
        { label: 'Total Jobs', value: analytics.totals.jobs },
        { label: 'Total Matches', value: analytics.totals.matches },
        { label: 'Assignments Today', value: analytics.totals.assignmentsToday },
      ];
      
      totals.forEach(({ label, value }) => {
        pdf.text(`${label}:`, 25, yPos);
        pdf.text(value.toString(), 80, yPos);
        yPos += 8;
      });

      // Try to capture charts
      try {
        const chartsElements = document.querySelectorAll('.recharts-wrapper');
        if (chartsElements.length > 0) {
          yPos += 10;
          pdf.setFontSize(14);
          pdf.setTextColor(146, 64, 14);
          pdf.text('Charts', 20, yPos);
          yPos += 10;

          for (let i = 0; i < Math.min(chartsElements.length, 2); i++) {
            const chartElement = chartsElements[i] as HTMLElement;
            const canvas = await html2canvas(chartElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const imgWidth = pageWidth - 40;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            if (yPos + imgHeight > 280) {
              pdf.addPage();
              yPos = 20;
            }
            
            pdf.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10;
          }
        }
      } catch (chartError) {
        console.warn('Could not capture charts:', chartError);
        // Continue without charts
      }

      // Save PDF
      pdf.save(`nest-report-${dateRange}days-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      toast.loading(t('offline.syncing'));
      
      const result = await syncPending();
      const newCount = await getPendingCount();
      setPendingCount(newCount);
      
      toast.dismiss();
      
      if (result.success > 0) {
        toast.success(`${t('offline.sync_success')}: ${result.success} items synced`);
        onSyncComplete?.();
      }
      
      if (result.failed > 0) {
        toast.error(`${t('offline.sync_failed')}: ${result.failed} items failed`);
      }
      
      if (result.success === 0 && result.failed === 0) {
        toast.success('Nothing to sync');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.dismiss();
      toast.error(t('offline.sync_failed'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-brown-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-brown-900 dark:text-cream-50 mb-4">
        Export & Sync
      </h3>
      
      <div className="space-y-3">
        {/* Export CSV */}
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brown-600 hover:bg-brown-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {exporting ? t('reports.exporting') : t('reports.export_csv')}
        </button>

        {/* Download PDF */}
        <button
          onClick={handleDownloadPDF}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4" />
          {exporting ? t('reports.generating_pdf') : t('reports.download_pdf')}
        </button>

        {/* Sync Now */}
        <button
          onClick={handleSyncNow}
          disabled={syncing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? t('offline.syncing') : t('offline.sync_now')}
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {pendingCount > 0 && (
        <p className="text-xs text-brown-600 dark:text-brown-400 mt-3 text-center">
          {pendingCount} {t('offline.sync_pending')}
        </p>
      )}
    </div>
  );
}
