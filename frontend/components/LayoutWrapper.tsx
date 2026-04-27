'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { initSampleActivity } from '@/lib/initSampleActivity'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  // Initialize sample activity data on first load
  useEffect(() => {
    initSampleActivity()
  }, [])

  // Check if we're on an auth page, home page, or shelter page
  const isAuthPage = pathname?.startsWith('/auth')
  const isShelterAuthPage = pathname?.startsWith('/shelter-auth')
  const isHomePage = pathname === '/'
  const isShelterPage = pathname?.startsWith('/shelter') || pathname?.startsWith('/dashboard/shelter')

  // Don't show sidebar/navbar on auth pages, home page, or shelter pages (they have their own layout)
  if (isAuthPage || isShelterAuthPage || isHomePage || isShelterPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
