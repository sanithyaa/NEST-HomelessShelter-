'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Inbox,
  Stethoscope,
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, roles: ['Volunteer', 'NGO', 'Admin'] },
  { href: '/profiles/all', labelKey: 'nav.profiles', icon: Users, roles: ['Volunteer', 'NGO', 'Admin'] },
  { href: '/resources/shelters', labelKey: 'nav.shelters', icon: Building2, roles: ['NGO', 'Admin'] },
  { href: '/resources/jobs', labelKey: 'nav.jobs', icon: Briefcase, roles: ['NGO', 'Admin'] },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings, roles: ['Volunteer', 'NGO', 'Admin'] },
  { href: '/help', labelKey: 'nav.help', icon: HelpCircle, roles: ['Volunteer', 'NGO', 'Admin'] },
]

const SHELTER_NAV_LINKS = [
  { href: '/dashboard/shelter', labelKey: 'nav.dashboard', icon: Home, roles: ['Shelter'] },
  { href: '/shelter/requests', labelKey: 'nav.requests', icon: Inbox, roles: ['Shelter'] },
  { href: '/shelter/residents', labelKey: 'nav.residents', icon: Users, roles: ['Shelter'] },
  { href: '/shelter/medical', labelKey: 'nav.medical', icon: Stethoscope, roles: ['Shelter'] },
  { href: '/help', labelKey: 'nav.help', icon: HelpCircle, roles: ['Shelter'] },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings, roles: ['Shelter'] },
]

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [role, setRole] = useState('Volunteer')
  const pathname = usePathname()

  // Get role from session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('session')
      const shelterSession = localStorage.getItem('shelter_session')
      
      if (shelterSession) {
        setRole('Shelter')
      } else if (session) {
        try {
          const user = JSON.parse(session)
          setRole(user.role || 'Volunteer')
        } catch {
          setRole('Volunteer')
        }
      }
    }
  }, [])

  const navLinks = role === 'Shelter' ? SHELTER_NAV_LINKS : NAV_LINKS
  const filteredLinks = navLinks.filter((link) => link.roles.includes(role))

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }, [pathname, onClose])

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{
          x: isOpen ? 0 : -300,
          width: collapsed ? '5rem' : '16rem',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 h-screen bg-tan dark:bg-dark-surface shadow-2xl z-50 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-8">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-2xl">🏠</span>
                <span className="font-bold text-lg text-deepbrown dark:text-dark-text">
                  NEST
                </span>
              </motion.div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 hover:bg-beige dark:hover:bg-dark-card rounded-lg transition-all duration-300"
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
            {filteredLinks.map(({ href, labelKey, icon: Icon }) => {
              const isActive = pathname === href || pathname?.startsWith(href + '/')
              return (
                <a
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative ${
                    isActive
                      ? 'bg-amber text-white shadow-lg'
                      : 'hover:bg-beige dark:hover:bg-dark-card text-deepbrown dark:text-dark-text'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 ${
                      !collapsed && 'group-hover:scale-110'
                    }`}
                  />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="font-medium"
                    >
                      {t(labelKey)}
                    </motion.span>
                  )}
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-2 w-1.5 h-8 bg-white rounded-full"
                    />
                  )}
                </a>
              )
            })}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-beige/50 dark:bg-dark-card rounded-xl text-xs text-brown dark:text-dark-muted"
            >
              <p className="font-semibold mb-1">{t('role')}: {t(role.toLowerCase())}</p>
              <p className="text-[10px]">v1.0.0 • NEST</p>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </>
  )
}
