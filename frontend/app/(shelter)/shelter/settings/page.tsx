'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useShelterGuard } from '@/lib/shelterGuard'
import { Globe, Moon, Sun, Building2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { SettingsCard } from '@/components/Shelter/settings/SettingsCard'
import { clearLocalShelterData } from '@/lib/offline'
import { PageHeader } from '@/components/PageHeader'

export default function ShelterSettingsPage() {
  const session = useShelterGuard()
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Get current language
    setCurrentLanguage(i18n.language || 'en')

    // Get current theme
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [i18n.language])

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    setCurrentLanguage(lang)
    toast.success(`Language changed to ${lang === 'en' ? 'English' : 'हिंदी'}`)
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    toast.success(`Theme changed to ${newTheme} mode`)
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all local shelter data? This action cannot be undone.')) {
      clearLocalShelterData()
      toast.success('Local shelter data cleared successfully')
      
      // Reload page to reflect changes
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <PageHeader
        title="Settings"
        subtitle="Manage your preferences and local data"
      />

      <div className="space-y-6">
        {/* Language Settings */}
        <SettingsCard title="Language">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-amber" />
              <div>
                <p className="text-sm font-medium text-deepbrown dark:text-dark-text">
                  Select Language
                </p>
                <p className="text-xs text-brown-600 dark:text-brown-400">
                  Choose your preferred language
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  currentLanguage === 'en'
                    ? 'bg-amber text-white'
                    : 'bg-tan dark:bg-dark-card text-deepbrown dark:text-dark-text hover:bg-beige dark:hover:bg-dark-border'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  currentLanguage === 'hi'
                    ? 'bg-amber text-white'
                    : 'bg-tan dark:bg-dark-card text-deepbrown dark:text-dark-text hover:bg-beige dark:hover:bg-dark-border'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </SettingsCard>

        {/* Theme Settings */}
        <SettingsCard title="Theme">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-amber" />
              ) : (
                <Moon className="w-5 h-5 text-amber" />
              )}
              <div>
                <p className="text-sm font-medium text-deepbrown dark:text-dark-text">
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </p>
                <p className="text-xs text-brown-600 dark:text-brown-400">
                  Toggle between light and dark theme
                </p>
              </div>
            </div>
            <button
              onClick={handleThemeToggle}
              className="relative inline-flex h-10 w-20 items-center rounded-full bg-tan dark:bg-dark-card transition-colors"
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-amber transition-transform ${
                  theme === 'dark' ? 'translate-x-11' : 'translate-x-1'
                }`}
              >
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-white m-1.5" />
                ) : (
                  <Moon className="w-5 h-5 text-white m-1.5" />
                )}
              </span>
            </button>
          </div>
        </SettingsCard>

        {/* Shelter Information */}
        <SettingsCard title="Shelter Information">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-amber mt-1" />
            <div className="space-y-2">
              <div>
                <p className="text-xs text-brown-600 dark:text-brown-400">Shelter Name</p>
                <p className="text-sm font-medium text-deepbrown dark:text-dark-text">
                  {session?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-brown-600 dark:text-brown-400">Shelter ID</p>
                <p className="text-sm font-medium text-deepbrown dark:text-dark-text font-mono">
                  {session?.shelterId || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-brown-600 dark:text-brown-400">Email</p>
                <p className="text-sm font-medium text-deepbrown dark:text-dark-text">
                  {session?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Developer Tools */}
        <SettingsCard title="Developer Tools (Local Only)">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-red-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-deepbrown dark:text-dark-text mb-1">
                Clear Local Data
              </p>
              <p className="text-xs text-brown-600 dark:text-brown-400 mb-3">
                Remove all mock shelter data from localStorage. This will clear residents, requests,
                medical records, and follow-ups. The page will reload automatically.
              </p>
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-medium"
              >
                Clear All Local Data
              </button>
            </div>
          </div>
        </SettingsCard>
      </div>
    </motion.div>
  )
}
