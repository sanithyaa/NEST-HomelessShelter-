'use client'

import { motion } from 'framer-motion'
import { 
  Building2, 
  Briefcase, 
  MapPin, 
  Phone, 
  Edit, 
  Trash2, 
  Users,
  DollarSign,
  Clock,
  Send
} from 'lucide-react'
import { Shelter, Job } from '@/lib/types'
import toast from 'react-hot-toast'
import { requestAssignment } from '@/lib/api'

interface ResourceCardProps {
  resource: Shelter | Job
  type: 'shelter' | 'job'
  index: number
  canModify: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function ResourceCard({ 
  resource, 
  type, 
  index, 
  canModify, 
  onEdit, 
  onDelete 
}: ResourceCardProps) {
  const isShelter = type === 'shelter'
  const shelter = isShelter ? (resource as Shelter) : null
  const job = !isShelter ? (resource as Job) : null

  const getAvailabilityBadge = () => {
    if (!shelter) return null
    
    const percentage = (shelter.occupied / shelter.capacity) * 100
    
    if (percentage >= 100) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          Full
        </span>
      )
    } else if (percentage >= 80) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber/20 text-amber">
          Limited
        </span>
      )
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          Available
        </span>
      )
    }
  }

  const handleRequest = async () => {
    try {
      await requestAssignment(type, resource.id)
      toast.success(`${type === 'shelter' ? 'Shelter' : 'Job'} request sent successfully!`)
    } catch (error) {
      toast.error('Failed to send request')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card hover:shadow-2xl transition-all duration-300 group"
      data-testid={`${type}-card-${resource.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isShelter ? 'bg-amber/20' : 'bg-blue-100 dark:bg-blue-900/20'
          }`}>
            {isShelter ? (
              <Building2 className="w-6 h-6 text-amber" />
            ) : (
              <Briefcase className="w-6 h-6 text-blue-500" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-deepbrown dark:text-dark-text group-hover:text-amber transition-colors">
              {isShelter ? shelter?.name : job?.title}
            </h3>
            {job && (
              <p className="text-sm text-brown dark:text-dark-muted">
                {job.employer}
              </p>
            )}
          </div>
        </div>
        {isShelter && getAvailabilityBadge()}
        {job && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            job.type === 'Full-time'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
          }`}>
            {job.type}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        {isShelter && shelter && (
          <>
            <div className="flex items-start gap-2 text-sm text-brown dark:text-dark-muted">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{shelter.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-brown dark:text-dark-muted">
              <Users className="w-4 h-4" />
              <span>
                <strong>{shelter.occupied}</strong> / {shelter.capacity} occupied
              </span>
            </div>
            {shelter.phone && (
              <div className="flex items-center gap-2 text-sm text-brown dark:text-dark-muted">
                <Phone className="w-4 h-4" />
                <span>{shelter.phone}</span>
              </div>
            )}
            {shelter.notes && (
              <p className="text-sm text-brown dark:text-dark-muted line-clamp-2 pt-2 border-t border-beige dark:border-dark-border">
                {shelter.notes}
              </p>
            )}
          </>
        )}

        {job && (
          <>
            <div className="flex items-start gap-2 text-sm text-brown dark:text-dark-muted">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{job.location}</span>
            </div>
            {job.wage && (
              <div className="flex items-center gap-2 text-sm text-brown dark:text-dark-muted">
                <DollarSign className="w-4 h-4" />
                <span>{job.wage}</span>
              </div>
            )}
            {job.description && (
              <p className="text-sm text-brown dark:text-dark-muted line-clamp-3 pt-2 border-t border-beige dark:border-dark-border">
                {job.description}
              </p>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-beige dark:border-dark-border">
        {canModify ? (
          <>
            <button
              onClick={onEdit}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
              aria-label={`Edit ${type}`}
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              aria-label={`Delete ${type}`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </>
        ) : (
          <button
            onClick={handleRequest}
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
            aria-label={`Request ${type}`}
          >
            <Send className="w-4 h-4" />
            {isShelter ? 'Request Shelter' : 'Apply for Job'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
