import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon?: LucideIcon
  color?: string
  delay?: number
}

export function StatsCard({ title, value, icon: Icon, color = 'text-amber', delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-dark-card shadow-lg hover:shadow-xl rounded-2xl p-6 border border-beige dark:border-dark-border transition-all duration-300 hover:scale-105"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-brown dark:text-dark-muted font-semibold text-sm uppercase tracking-wide">
          {title}
        </h3>
        {Icon && <Icon className={`w-8 h-8 ${color}`} />}
      </div>
      <p className="text-4xl font-bold text-deepbrown dark:text-dark-text">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </motion.div>
  )
}
