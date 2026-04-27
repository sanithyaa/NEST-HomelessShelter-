'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Inbox, Users, Stethoscope, Settings, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard/shelter' },
  { icon: Inbox, label: 'Requests', href: '/shelter/requests' },
  { icon: Users, label: 'Residents', href: '/shelter/residents' },
  { icon: Stethoscope, label: 'Medical Records', href: '/shelter/medical' },
  { icon: Settings, label: 'Settings', href: '/shelter/settings' },
]

export function ShelterSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-tan dark:border-dark-border">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏠</span>
          <div>
            <h1 className="text-2xl font-bold text-deepbrown dark:text-dark-text">NEST</h1>
            <p className="text-xs text-brown dark:text-dark-muted">Shelter Portal</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-brown text-white shadow-lg'
                    : 'text-deepbrown dark:text-dark-text hover:bg-tan dark:hover:bg-dark-card'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-tan dark:border-dark-border">
        <p className="text-xs text-center text-brown dark:text-dark-muted">
          © 2024 NEST Shelter
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-brown text-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-cream dark:bg-dark-surface border-r border-tan dark:border-dark-border h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-cream dark:bg-dark-surface z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
