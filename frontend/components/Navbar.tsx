'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Globe, Wifi, WifiOff, User, Menu, RefreshCw, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { getPendingCount } from '@/lib/offline'
import toast from 'react-hot-toast'

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)
  const [online, setOnline] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }

    // Check for session
    const session = localStorage.getItem('session')
    const shelterSession = localStorage.getItem('shelter_session')
    if (session) {
      try {
        const user = JSON.parse(session)
        setRole(user.role || 'Volunteer')
      } catch {
        setRole(null)
      }
    } else if (shelterSession) {
      try {
        const user = JSON.parse(shelterSession)
        setRole(user.role || 'Shelter')
      } catch {
        setRole(null)
      }
    }
  }, [])

  useEffect(() => {
    setOnline(navigator.onLine)
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Load pending count
    getPendingCount().then(setPendingCount)
    
    // Poll for pending count updates
    const interval = setInterval(() => {
      getPendingCount().then(setPendingCount)
    }, 5000)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
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
    localStorage.removeItem('session')
    localStorage.removeItem('shelter_session')
    toast.success('Logged out successfully')
    router.push('/auth/login')
  }

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg text-deepbrown dark:text-dark-text px-4 md:px-6 py-3 shadow-lg rounded-b-2xl border-b border-beige dark:border-dark-border"
    >
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-all duration-300"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link
          href="/dashboard"
          className="font-bold text-lg md:text-xl hover:text-amber transition-colors duration-300 flex items-center gap-2"
        >
          <span className="text-2xl">🏠</span>
          NEST
        </Link>
      </div>

      {/* Right: Controls */}
      <div className="flex gap-2 md:gap-4 items-center">
        {/* Sync Indicator */}
        {pendingCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-all duration-300"
            title={`${pendingCount} ${t('offline.sync_pending')}`}
          >
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-orange-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {pendingCount}
            </span>
          </motion.div>
        )}

        {/* Language Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLanguage}
          className="p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-all duration-300 hidden sm:flex items-center gap-1"
          title="Toggle Language"
        >
          <Globe className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-xs font-medium hidden md:inline">
            {i18n.language === 'en' ? 'EN' : 'हिं'}
          </span>
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
            <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber" />
          ) : (
            <Moon className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </motion.button>

        {/* User Info with Role */}
        {role ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-2 bg-amber/10 dark:bg-amber/20 rounded-lg border border-amber/30">
              <User className="w-4 h-4 md:w-5 md:h-5 text-amber" />
              <div className="flex flex-col">
                <span className="text-xs md:text-sm font-semibold text-deepbrown dark:text-dark-text">
                  {typeof window !== 'undefined' && (() => {
                    const session = localStorage.getItem('session')
                    if (session) {
                      try {
                        const user = JSON.parse(session)
                        return user.name || 'User'
                      } catch {
                        return 'User'
                      }
                    }
                    return 'User'
                  })()}
                </span>
                <span className="text-xs font-medium text-amber">{role}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 text-red-600 dark:text-red-400"
              title="Logout"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </div>
        ) : (
          <Link
            href="/shelter-auth/login"
            className="px-3 py-2 text-xs md:text-sm font-medium bg-brown hover:bg-deepbrown text-white rounded-lg transition-colors duration-300"
          >
            Shelter Login
          </Link>
        )}
      </div>
    </motion.nav>
  )
}
