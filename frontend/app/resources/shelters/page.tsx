'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { getShelters, createShelter, updateShelter, deleteShelter } from '@/lib/api'
import { Shelter } from '@/lib/types'
import { ResourceCard } from '@/components/ResourceCard'
import { ResourceModal } from '@/components/ResourceModal'
import { logActivity } from '@/lib/activityLog'

export default function SheltersPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null)
  const [userRole, setUserRole] = useState<'Volunteer' | 'NGO' | 'Admin'>('Volunteer')
  const [mounted, setMounted] = useState(false)

  // Load user role on client side only
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session') || '{}')
    setUserRole(session.role || 'Volunteer')
    setMounted(true)
  }, [])

  const { data: shelters = [], isLoading } = useQuery({
    queryKey: ['shelters'],
    queryFn: getShelters,
  })

  const createMutation = useMutation({
    mutationFn: createShelter,
    onMutate: async (newShelter) => {
      await queryClient.cancelQueries({ queryKey: ['shelters'] })
      const previous = queryClient.getQueryData(['shelters'])
      queryClient.setQueryData(['shelters'], (old: Shelter[] = []) => [
        ...old,
        { ...newShelter, id: 'temp-' + Date.now() },
      ])
      return { previous }
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['shelters'], context?.previous)
      toast.error(error.message)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shelters'] })
      toast.success('Shelter added successfully!')
      logActivity(`🏠 Shelter added: ${data.name}`)
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Shelter> }) =>
      updateShelter(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['shelters'] })
      const previous = queryClient.getQueryData(['shelters'])
      queryClient.setQueryData(['shelters'], (old: Shelter[] = []) =>
        old.map((s) => (s.id === id ? { ...s, ...data } : s))
      )
      return { previous }
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['shelters'], context?.previous)
      toast.error(error.message)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shelters'] })
      toast.success('Shelter updated successfully!')
      logActivity(`🏠 Shelter updated: ${data.name}`)
      setIsModalOpen(false)
      setEditingShelter(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShelter,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['shelters'] })
      const previous = queryClient.getQueryData(['shelters'])
      queryClient.setQueryData(['shelters'], (old: Shelter[] = []) =>
        old.filter((s) => s.id !== id)
      )
      return { previous }
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['shelters'], context?.previous)
      toast.error('Failed to delete shelter')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelters'] })
      toast.success('Shelter deleted successfully!')
    },
  })

  const filteredShelters = shelters.filter((shelter) =>
    shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shelter.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportCSV = () => {
    const csv = [
      ['Name', 'Address', 'Capacity', 'Occupied', 'Phone', 'Notes'],
      ...shelters.map((s) => [
        s.name,
        s.address,
        s.capacity,
        s.occupied,
        s.phone || '',
        s.notes || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shelters-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('CSV exported!')
  }

  const handleEdit = (shelter: Shelter) => {
    setEditingShelter(shelter)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this shelter?')) {
      deleteMutation.mutate(id)
    }
  }

  const canModify = mounted && (userRole === 'NGO' || userRole === 'Admin')

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-deepbrown dark:text-dark-text mb-2">
            Shelters
          </h1>
          <p className="text-brown dark:text-dark-muted">
            {filteredShelters.length} shelter{filteredShelters.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {canModify && (
            <button
              onClick={() => {
                setEditingShelter(null)
                setIsModalOpen(true)
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Shelter
            </button>
          )}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
          <input
            type="text"
            placeholder="Search shelters by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </motion.div>

      {/* Shelters Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-tan dark:bg-dark-surface rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-tan dark:bg-dark-surface rounded w-full mb-2"></div>
              <div className="h-4 bg-tan dark:bg-dark-surface rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShelters.map((shelter, index) => (
            <ResourceCard
              key={shelter.id}
              resource={shelter}
              type="shelter"
              index={index}
              canModify={canModify}
              onEdit={() => handleEdit(shelter)}
              onDelete={() => handleDelete(shelter.id)}
            />
          ))}
        </div>
      )}

      {filteredShelters.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <p className="text-brown dark:text-dark-muted">No shelters found</p>
        </motion.div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ResourceModal
          type="shelter"
          resource={editingShelter}
          onClose={() => {
            setIsModalOpen(false)
            setEditingShelter(null)
          }}
          onSave={(data) => {
            if (editingShelter) {
              updateMutation.mutate({ id: editingShelter.id, data })
            } else {
              createMutation.mutate(data as Omit<Shelter, 'id'>)
            }
          }}
        />
      )}
    </div>
  )
}
