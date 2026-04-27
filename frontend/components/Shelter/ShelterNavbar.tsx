'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Globe, User, LogOut, WifiOff, Wifi } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { getShelterSession, clearShelterSession } from '@/lib/shelterAuth'
import toast from 'react-hot-toast'

export function ShelterNavbar() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)
  const [online, setOnline] = useState(true)
  const session = getShelterSession()

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    setOnline(navigator.onLine)
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', String(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(newLang)
  }

  const handleLogout = () => {
    clearShelterSession()
    toast.success('Logged out successfully')
    router.push('/shelter-auth/login')
  }

  if (!session) return null

  return (
    <motion.nav
      className="bg-beige dark:bg-dark-surface shadow-md rounded-2xl p-4 mb-6 flex justify-between items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left: Shelter Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-amber/10 dark:bg-amber/20 rounded-lg border border-amber/30">
          <div className="w-8 h-8 bg-brown rounded-full flex items-center justify-center text-white font-bold text-sm">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-deepbrown dark:text-dark-text">
              {session.name}
            </h2>
            <p className="text-xs text-amber font-medium">Shelter Staff</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 text-red-600 dark:text-red-400"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Right: Controls */}
      <div className="flex gap-3 items-center">
        {/* Online/Offline Indicator */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            online
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {online ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">{online ? 'Online' : 'Offline'}</span>
        </div>

        {/* Language Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLanguage}
          className="p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-all duration-300"
          title="Toggle Language"
        >
          <Globe className="w-5 h-5 text-brown dark:text-dark-text" />
        </motion.button>

        {/* Dark Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className="p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-all duration-300"
          title="Toggle Dark Mode"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber" />
          ) : (
            <Moon className="w-5 h-5 text-brown" />
          )}
        </motion.button>
      </div>
    </motion.nav>
  )
}
