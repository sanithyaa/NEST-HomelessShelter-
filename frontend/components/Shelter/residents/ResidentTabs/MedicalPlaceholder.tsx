'use client'

import { motion } from 'framer-motion'
import { Stethoscope } from 'lucide-react'

export function MedicalPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      role="tabpanel"
      id="medical-panel"
      className="bg-beige dark:bg-dark-surface rounded-2xl p-12 text-center shadow-lg"
    >
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-tan dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8 text-brown dark:text-dark-muted" />
        </div>
        <h3 className="text-2xl font-bold text-deepbrown dark:text-dark-text mb-2">
          Medical Records Coming Soon
        </h3>
        <p className="text-brown dark:text-dark-muted">
          This tab will show medical records, health history, scheduled follow-ups, and allow
          adding new medical entries for this resident.
        </p>
      </div>
    </motion.div>
  )
}
