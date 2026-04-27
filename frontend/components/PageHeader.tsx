'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-deepbrown dark:text-dark-text font-poppins">
          {title}
        </h1>
        {subtitle && (
          <p className="text-brown dark:text-dark-muted text-lg mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </motion.div>
  )
}
