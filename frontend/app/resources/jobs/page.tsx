'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { getJobs, createJob, updateJob, deleteJob } from '@/lib/api'
import { Job } from '@/lib/types'
import { ResourceCard } from '@/components/ResourceCard'
import { ResourceModal } from '@/components/ResourceModal'
import { logActivity } from '@/lib/activityLog'

export default function JobsPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [userRole, setUserRole] = useState<'Volunteer' | 'NGO' | 'Admin'>('Volunteer')
  const [mounted, setMounted] = useState(false)

  // Load user role on client side only
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session') || '{}')
    setUserRole(session.role || 'Volunteer')
    setMounted(true)
  }, [])

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  })

  const createMutation = useMutation({
    mutationFn: createJob,
    onMutate: async (newJob) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] })
      const previous = queryClient.getQueryData(['jobs'])
      queryClient.setQueryData(['jobs'], (old: Job[] = []) => [
        ...old,
        { ...newJob, id: 'temp-' + Date.now() },
      ])
      return { previous }
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['jobs'], context?.previous)
      toast.error('Failed to create job')
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job added successfully!')
      logActivity(`💼 Job posted: ${data.title}`)
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
      updateJob(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] })
      const previous = queryClient.getQueryData(['jobs'])
      queryClient.setQueryData(['jobs'], (old: Job[] = []) =>
        old.map((j) => (j.id === id ? { ...j, ...data } : j))
      )
      return { previous }
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['jobs'], context?.previous)
      toast.error('Failed to update job')
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job updated successfully!')
      logActivity(`💼 Job updated: ${data.title}`)
      setIsModalOpen(false)
      setEditingJob(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] })
      const previous = queryClient.getQueryData(['jobs'])
      queryClient.setQueryData(['jobs'], (old: Job[] = []) =>
        old.filter((j) => j.id !== id)
      )
      return { previous }
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['jobs'], context?.previous)
      toast.error('Failed to delete job')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job deleted successfully!')
    },
  })

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportCSV = () => {
    const csv = [
      ['Title', 'Employer', 'Location', 'Type', 'Wage', 'Description'],
      ...jobs.map((j) => [
        j.title,
        j.employer,
        j.location,
        j.type,
        j.wage || '',
        j.description || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('CSV exported!')
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
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
            Job Opportunities
          </h1>
          <p className="text-brown dark:text-dark-muted">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
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
                setEditingJob(null)
                setIsModalOpen(true)
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Job
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
            placeholder="Search jobs by title, employer, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </motion.div>

      {/* Jobs Grid */}
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
          {filteredJobs.map((job, index) => (
            <ResourceCard
              key={job.id}
              resource={job}
              type="job"
              index={index}
              canModify={canModify}
              onEdit={() => handleEdit(job)}
              onDelete={() => handleDelete(job.id)}
            />
          ))}
        </div>
      )}

      {filteredJobs.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <p className="text-brown dark:text-dark-muted">No jobs found</p>
        </motion.div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ResourceModal
          type="job"
          resource={editingJob}
          onClose={() => {
            setIsModalOpen(false)
            setEditingJob(null)
          }}
          onSave={(data) => {
            if (editingJob) {
              updateMutation.mutate({ id: editingJob.id, data })
            } else {
              createMutation.mutate(data as Omit<Job, 'id'>)
            }
          }}
        />
      )}
    </div>
  )
}
