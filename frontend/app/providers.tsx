'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    async function initMSW() {
      if (typeof window !== 'undefined') {
        try {
          const { worker } = await import('@/mocks/browser')
          await worker.start({
            onUnhandledRequest: 'bypass',
            quiet: true,
          })
          console.log('MSW initialized')
          setMswReady(true)
        } catch (error) {
          console.error('MSW initialization failed:', error)
          // Continue anyway
          setMswReady(true)
        }
      }
    }

    initMSW()
  }, [])

  // Always render children, don't block on MSW
  return <>{children}</>
}
