'use client'

import { motion } from 'framer-motion'

interface SettingsCardProps {
  title: string
  children: React.ReactNode
}

export function SettingsCard({ title, children }: SettingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-cream-50 dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-brown-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-deepbrown dark:text-dark-text mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  )
}
