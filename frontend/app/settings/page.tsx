'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sun, Moon, Globe, Database, Trash2, RefreshCw, Info, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import { syncPending, getPendingCount } from '@/lib/offline';
import { APP_VERSION, BUILD_DATE, CREDITS } from '@/lib/appInfo';
import localforage from 'localforage';

export default function SettingsPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Load theme
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(isDarkMode);

    // Load pending count
    getPendingCount().then(setPendingCount);

    setMounted(true);
  }, [router]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(`${newDarkMode ? 'Dark' : 'Light'} mode enabled`);
  };

  const resetToSystemDefault = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    localStorage.setItem('darkMode', String(prefersDark));
    
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success('Theme reset to system default');
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    toast.success(`Language changed to ${lang === 'en' ? 'English' : 'हिंदी'}`);
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
        toast.success(`${result.success} items synced successfully`);
      } else if (result.failed > 0) {
        toast.error(`${result.failed} items failed to sync`);
      } else {
        toast.success('Nothing to sync');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearOfflineData = async () => {
    try {
      // Clear all localforage stores
      await localforage.clear();
      
      // Clear localStorage drafts
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('draft_') || key.startsWith('mock_')) {
          localStorage.removeItem(key);
        }
      });
      
      setPendingCount(0);
      setShowClearConfirm(false);
      toast.success('Offline data cleared successfully');
    } catch (error) {
      toast.error('Failed to clear offline data');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-brown-600 dark:text-brown-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-brown-900 dark:text-cream-50 mb-2">
            {t('nav.settings')}
          </h1>
          <p className="text-brown-600 dark:text-brown-400">
            Manage your preferences and application settings
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Appearance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-brown-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                {isDark ? (
                  <Moon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-brown-900 dark:text-cream-50">
                Appearance
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brown-900 dark:text-cream-50">Theme</p>
                  <p className="text-sm text-brown-600 dark:text-brown-400">
                    Choose your preferred color scheme
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    isDark ? 'bg-brown-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      isDark ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={resetToSystemDefault}
                className="flex items-center gap-2 px-4 py-2 text-sm text-brown-700 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Monitor className="w-4 h-4" />
                Reset to System Default
              </button>
            </div>
          </motion.div>

          {/* Language Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-brown-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-brown-900 dark:text-cream-50">
                Language & Localization
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700 dark:text-brown-300 mb-2">
                Select Language
              </label>
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-brown-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent bg-white dark:bg-gray-700 text-brown-900 dark:text-cream-50"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </motion.div>

          {/* Offline Data Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-brown-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-brown-900 dark:text-cream-50">
                Offline Data
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-brown-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-brown-700 dark:text-brown-300">
                    Pending Queue Items
                  </span>
                  <span className="text-lg font-bold text-brown-900 dark:text-cream-50">
                    {pendingCount}
                  </span>
                </div>
                <p className="text-xs text-brown-600 dark:text-brown-400">
                  Items waiting to sync when online
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSyncNow}
                  disabled={syncing || pendingCount === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>

                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Offline Data
                </button>
              </div>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-brown-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-brown-900 dark:text-cream-50">
                About App
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brown-600 dark:text-brown-400">Version</span>
                <span className="font-medium text-brown-900 dark:text-cream-50">{APP_VERSION}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-600 dark:text-brown-400">Build Date</span>
                <span className="font-medium text-brown-900 dark:text-cream-50">{BUILD_DATE}</span>
              </div>
              
              <div className="pt-3 border-t border-brown-200 dark:border-gray-700">
                <p className="text-brown-600 dark:text-brown-400 mb-2">Credits:</p>
                <ul className="space-y-1 text-brown-700 dark:text-brown-300">
                  <li>• Mapping: {CREDITS.mapping}</li>
                  <li>• API Mocking: {CREDITS.mocking}</li>
                  <li>• Support: {CREDITS.volunteers}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-brown-900 dark:text-cream-50 mb-2">
              Clear Offline Data?
            </h3>
            <p className="text-brown-600 dark:text-brown-400 mb-6">
              This will permanently delete all offline drafts and pending queue items. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border border-brown-300 dark:border-gray-600 text-brown-700 dark:text-brown-300 rounded-lg hover:bg-brown-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearOfflineData}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear Data
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
