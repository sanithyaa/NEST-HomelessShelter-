'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Plus, Eye, Bed, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import { getResidents } from '@/lib/shelterApi'
import { AddResidentModal } from '@/components/AddResidentModal'
import { useShelterGuard } from '@/lib/shelterGuard'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/Badge'

export default function ShelterResidentsPage() {
  const session = useShelterGuard()
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female' | 'Other'>('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { data: residents = [], isLoading } = useQuery({
    queryKey: ['shelter-residents'],
    queryFn: () => getResidents('active'),
  })

  // Filter residents
  const filteredResidents = residents.filter((resident) => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGender = genderFilter === 'All' || resident.gender === genderFilter
    return matchesSearch && matchesGender
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-10 bg-tan dark:bg-dark-surface rounded-xl w-64 animate-pulse" />
          <div className="h-6 bg-tan dark:bg-dark-surface rounded-xl w-96 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-cream-50 dark:bg-dark-surface rounded-2xl p-6 shadow-lg animate-pulse"
            >
              <div className="h-6 bg-tan dark:bg-dark-card rounded w-3/4 mb-4" />
              <div className="h-4 bg-tan dark:bg-dark-card rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-7xl mx-auto p-6 space-y-6"
    >
      <PageHeader
        title="Residents"
        subtitle="Current residents staying in the shelter"
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Resident
          </button>
        }
      />

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-cream-50 dark:bg-dark-surface rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4"
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-600 dark:text-brown-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>

        {/* Gender Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-brown-600 dark:text-brown-400" />
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-dark-card border border-brown-200 dark:border-gray-700 rounded-xl text-deepbrown dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="text-sm text-brown-600 dark:text-brown-400">
        Showing {filteredResidents.length} of {residents.length} residents
      </div>

      {/* Residents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh]">
        <AnimatePresence mode="popLayout">
          {filteredResidents.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={Users}
                title="No Residents Found"
                description={
                  searchTerm || genderFilter !== 'All'
                    ? 'Try adjusting your filters'
                    : 'Click the button above to add the first resident'
                }
                action={
                  !searchTerm && genderFilter === 'All' ? (
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Resident
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            filteredResidents.map((resident, index) => (
              <motion.div
                key={resident.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-cream-50 dark:bg-dark-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-brown-200 dark:border-gray-700"
              >
                <div className="space-y-4">
                  {/* Photo */}
                  {resident.photo && (
                    <div className="w-full h-32 overflow-hidden rounded-xl">
                      <img
                        src={resident.photo}
                        alt={resident.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text">
                        {resident.name}
                      </h3>
                      <p className="text-sm text-brown-600 dark:text-brown-400">
                        {resident.age} years
                      </p>
                    </div>
                    <Badge
                      label={resident.gender}
                      variant={resident.gender.toLowerCase() as 'male' | 'female' | 'other'}
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    {(resident.bed_number || resident.bedNumber) && (
                      <div className="flex items-center gap-2 text-sm">
                        <Bed className="w-4 h-4 text-amber" />
                        <span className="text-brown-800 dark:text-brown-200">
                          Bed: <span className="font-semibold">{resident.bed_number || resident.bedNumber}</span>
                        </span>
                      </div>
                    )}
                    {(resident.admission_date || resident.admissionDate || resident.admittedAt) && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-amber" />
                        <span className="text-brown-800 dark:text-brown-200">
                          Admitted:{' '}
                          {new Date(resident.admission_date || resident.admissionDate || resident.admittedAt || '').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes Preview */}
                  {resident.notes && (
                    <p className="text-sm text-brown-600 dark:text-brown-400 line-clamp-2">
                      {resident.notes}
                    </p>
                  )}

                  {/* View Button */}
                  <Link
                    href={`/shelter/residents/${resident.resident_id || resident.id}`}
                    className="w-full px-4 py-2 bg-amber hover:bg-brown text-white rounded-xl transition-colors text-center font-medium flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Resident Modal */}
      <AddResidentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </motion.div>
  )
}
