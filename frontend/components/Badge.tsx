'use client'

interface BadgeProps {
  label: string
  variant?: 'high' | 'medium' | 'low' | 'male' | 'female' | 'other' | 'neutral' | 'completed' | 'pending'
  className?: string
}

const variantStyles = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  male: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  female: 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
  other: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  neutral: 'bg-tan text-brown dark:bg-dark-card dark:text-dark-text',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
}

export function Badge({ label, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {label}
    </span>
  )
}
