'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    async function initMSW() {
      if (typeof window !== 'undefined') {
        try {
          console.log('[MSW] Starting initialization...')
          const { worker } = await import('../mocks/browser')
          console.log('[MSW] Worker imported, starting...')
          
          await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
              url: '/mockServiceWorker.js',
              options: {
                scope: '/'
              }
            },
            quiet: false
          })
          
          console.log('[MSW] ✅ Mocking enabled successfully!')
          setMswReady(true)
        } catch (error) {
          console.error('[MSW] ❌ Failed to start:', error)
          console.error('[MSW] Error details:', error)
          setMswReady(true) // Continue anyway to not block the app
        }
      }
    }

    initMSW()
  }, [])

  if (!mswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-beige dark:bg-dark-bg">
        <div className="text-lg text-deepbrown dark:text-dark-text">Initializing...</div>
      </div>
    )
  }

  return <>{children}</>
}
