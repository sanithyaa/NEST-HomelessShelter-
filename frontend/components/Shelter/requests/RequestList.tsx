'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Filter, Inbox } from 'lucide-react'
import type { AssignmentRequest } from '@/lib/types'
import { getPendingRequests, acceptRequest, rejectRequest } from '@/lib/shelterApi'
import { RequestCard } from './RequestCard'
import { RequestDetailModal } from './RequestDetailModal'
import toast from 'react-hot-toast'

interface RequestListProps {
  shelterId: string
}

export function RequestList({ shelterId }: RequestListProps) {
  const queryClient = useQueryClient()
  const [selectedRequest, setSelectedRequest] = useState<AssignmentRequest | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: requests, isLoading } = useQuery<AssignmentRequest[]>({
    queryKey: ['shelter-requests', shelterId],
    queryFn: () => getPendingRequests(),
    enabled: !!shelterId,
  })

  const handleAccept = async () => {
    if (!selectedRequest) return

    const requestId = selectedRequest.request_id || parseInt(selectedRequest.id || '0')
    const residentName = selectedRequest.HomelessProfile?.name || 'resident'

    const loadingToast = toast.loading('Accepting request...')
    try {
      const result = await acceptRequest(requestId, {})
      toast.dismiss(loadingToast)
      toast.success(result.msg || 'Request accepted successfully!')

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['shelter-requests'] })
      queryClient.invalidateQueries({ queryKey: ['shelter-residents'] })
      queryClient.invalidateQueries({ queryKey: ['shelter-bed-stats'] })
      queryClient.invalidateQueries({ queryKey: ['shelter-recent-admissions'] })
      queryClient.invalidateQueries({ queryKey: ['shelter-pending-requests'] })
      
      // Activity logging
      console.log(`Activity: Accepted request for ${residentName}`)
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Failed to accept request')
      console.error('Accept error:', error)
    }
  }

  const handleReject = async (reason: string) => {
    if (!selectedRequest) return

    const requestId = selectedRequest.request_id || parseInt(selectedRequest.id || '0')
    const residentName = selectedRequest.HomelessProfile?.name || 'resident'

    const loadingToast = toast.loading('Rejecting request...')
    try {
      const result = await rejectRequest(requestId, reason)
      toast.dismiss(loadingToast)
      toast.success(result.msg || 'Request rejected')

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['shelter-requests'] })
      queryClient.invalidateQueries({ queryKey: ['shelter-pending-requests'] })
      
      // Activity logging
      console.log(`Activity: Rejected request for ${residentName}`)
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Failed to reject request')
      console.error('Reject error:', error)
    }
  }

  // Filter requests
  const filteredRequests = requests?.filter((request) => {
    const matchesPriority = priorityFilter === 'All' || request.HomelessProfile?.priority === priorityFilter
    const matchesSearch = request.HomelessProfile?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ?? true
    return matchesPriority && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-beige dark:bg-dark-surface rounded-2xl p-6 shadow-lg animate-pulse"
          >
            <div className="h-6 bg-tan dark:bg-dark-card rounded w-3/4 mb-4" />
            <div className="h-4 bg-tan dark:bg-dark-card rounded w-full mb-2" />
            <div className="h-4 bg-tan dark:bg-dark-card rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
          <input
            type="text"
            placeholder="Search by resident name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-tan dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-deepbrown dark:text-dark-text placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown dark:text-dark-muted" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="pl-10 pr-8 py-3 border border-tan dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-deepbrown dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber appearance-none cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Request List */}
      {filteredRequests && filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <RequestCard
                request={request}
                onViewDetails={() => setSelectedRequest(request)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-tan dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-10 h-10 text-brown dark:text-dark-muted" />
          </div>
          <h3 className="text-xl font-semibold text-deepbrown dark:text-dark-text mb-2">
            No Requests Found
          </h3>
          <p className="text-brown dark:text-dark-muted">
            {searchQuery || priorityFilter !== 'All'
              ? 'Try adjusting your filters'
              : 'No pending admission requests at the moment'}
          </p>
        </motion.div>
      )}

      {/* Detail Modal */}
      <RequestDetailModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  )
}
