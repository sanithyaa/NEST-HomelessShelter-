'use client'

import { motion } from 'framer-motion'

interface TabsContainerProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'medical', label: 'Medical' },
  { id: 'logs', label: 'Daily Logs' },
  { id: 'discharge', label: 'Discharge' },
]

export function TabsContainer({ activeTab, setActiveTab }: TabsContainerProps) {
  return (
    <div className="mb-6">
      <div
        role="tablist"
        className="flex gap-1 bg-tan dark:bg-dark-card rounded-xl p-1 overflow-x-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg font-medium transition-all duration-300 relative ${
              activeTab === tab.id
                ? 'text-white bg-brown shadow-lg'
                : 'text-deepbrown dark:text-dark-text hover:bg-beige dark:hover:bg-dark-surface'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-amber rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
