import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { ReactQueryProvider } from '@/lib/react-query-provider'
import { LayoutWrapper } from '@/components/LayoutWrapper'
import { Toaster } from 'react-hot-toast'
import { ClientI18nProvider } from '@/components/ClientI18nProvider'
import { OfflineBanner } from '@/components/OfflineBanner'
import { MSWProvider } from '@/components/MSWProvider'

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NEST - Homeless People Aid & Management',
  description: 'Humanitarian aid and homeless management system',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className="bg-cream dark:bg-dark-bg text-deepbrown dark:text-dark-text font-poppins transition-colors overflow-x-hidden">
        <MSWProvider>
          <ReactQueryProvider>
            <ClientI18nProvider>
              <OfflineBanner />
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                success: {
                  style: {
                    background: '#FEF7F0',
                    color: '#3C2F2F',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#FEF7F0',
                  },
                },
                error: {
                  style: {
                    background: '#FEE2E2',
                    color: '#991B1B',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FEE2E2',
                  },
                },
                loading: {
                  style: {
                    background: '#FEF3C7',
                    color: '#92400E',
                    borderRadius: '12px',
                    padding: '16px',
                  },
                },
              }}
            />
            </ClientI18nProvider>
          </ReactQueryProvider>
        </MSWProvider>
      </body>
    </html>
  )
}
