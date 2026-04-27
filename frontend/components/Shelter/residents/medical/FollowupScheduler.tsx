'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Plus } from 'lucide-react'
import { scheduleFollowup } from '@/lib/api'
import { getShelterSession } from '@/lib/shelterAuth'
import toast from 'react-hot-toast'

interface FollowupSchedulerProps {
  record: {
    id: string
    diagnosis: string
  }
  resident: {
    id: string
    name: string
  }
}

export function FollowupScheduler({ record, resident }: FollowupSchedulerProps) {
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const queryClient = useQueryClient()
  const session = getShelterSession()

  const mutation = useMutation({
    mutationFn: () =>
      scheduleFollowup({
        recordId: record.id,
        residentId: resident.id,
        residentName: resident.name,
        shelterId: session?.shelterId || 'S001',
        date,
        notes: notes || `Follow-up for: ${record.diagnosis}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records', resident.id] })
      queryClient.invalidateQueries({ queryKey: ['followups', session?.shelterId] })
      toast.success('Follow-up scheduled')
      setDate('')
      setNotes('')
      
      // Activity logging
      console.log(`Activity: Scheduled follow-up for ${resident.name}`)
    },
    onError: () => {
      toast.error('Failed to schedule follow-up')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) {
      toast.error('Please select a date')
      return
    }
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-deepbrown dark:text-dark-text">
          Schedule Follow-Up
        </span>
      </div>
      
      <div className="space-y-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 text-sm border border-tan dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-deepbrown dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          className="w-full px-3 py-2 text-sm border border-tan dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-deepbrown dark:text-dark-text placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {mutation.isPending ? 'Scheduling...' : 'Schedule Follow-Up'}
        </button>
      </div>
    </form>
  )
}
