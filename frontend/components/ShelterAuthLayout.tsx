'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home } from 'lucide-react'

export function ShelterAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-tan to-beige dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex flex-col items-center justify-center p-4">
      {/* Logo/Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-deepbrown dark:text-dark-text mb-2">
          NEST
        </h1>
        <p className="text-brown dark:text-dark-muted text-sm">
          Shelter staff — access your shelter dashboard
        </p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="bg-white dark:bg-dark-surface shadow-2xl rounded-2xl p-8 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {children}
      </motion.div>

      {/* Back to main site link */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link
          href="/"
          className="text-sm text-brown dark:text-dark-muted hover:text-deepbrown dark:hover:text-dark-text transition-colors inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to main site
        </Link>
      </motion.div>
    </div>
  )
}
