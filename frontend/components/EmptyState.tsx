'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-cream-50 dark:bg-dark-surface rounded-2xl p-12 text-center shadow-lg border border-brown-200 dark:border-gray-700"
    >
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-beige/50 dark:bg-dark-card rounded-full">
          <Icon className="w-16 h-16 text-brown-400 dark:text-brown-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-brown-600 dark:text-brown-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </motion.div>
  )
}
