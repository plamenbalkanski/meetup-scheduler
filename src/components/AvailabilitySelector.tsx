'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

interface ResponseType {
  name: string
}

interface TimeSlot {
  id: string
  startTime: string | Date
  endTime: string | Date
  displayTime?: string
  responses: ResponseType[]
}

interface MeetUp {
  id: string
  title: string
  description?: string | null
  address?: string | null
  useTimeRanges: boolean
  timeSlots: TimeSlot[]
  responses: any[]
}

interface Props {
  meetup: MeetUp
}

export default function AvailabilitySelector({ meetup }: Props) {
  const [name, setName] = useState('')
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/meetups/${meetup.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          timeSlotIds: selectedSlots,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit availability')
      
      toast.success('Availability submitted successfully!')
      setName('')
      setSelectedSlots([])
    } catch (error) {
      toast.error('Failed to submit availability')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTimeSlot = (slotId: string) => {
    setSelectedSlots(prev => 
      prev.includes(slotId)
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    )
  }

  const formatSlot = (slot: TimeSlot) => {
    const date = new Date(slot.startTime)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }),
      time: slot.displayTime || 'All Day'
    }
  }

  // Group time slots by date
  const slotsByDate = meetup.timeSlots.reduce((acc, slot) => {
    const date = format(new Date(slot.startTime), 'yyyy-MM-dd')
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {} as Record<string, typeof meetup.timeSlots>)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Your Name <span className="text-red-500 font-medium">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
          placeholder="Enter your name"
          aria-required="true"
        />
        <p className="mt-1 text-sm text-gray-500">
          This will be displayed to other participants
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(slotsByDate).map(([date, slots]) => (
          <div key={date} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">
              {format(new Date(date), 'EEEE, MMMM d')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {slots.map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleTimeSlot(slot.id)}
                  className={`p-2 rounded-md text-sm ${
                    selectedSlots.includes(slot.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {format(new Date(slot.startTime), 'h:mm a')}
                  {slot.responses.length > 0 && (
                    <span className="text-xs block">
                      {slot.responses.length} available
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting || !name || selectedSlots.length === 0}
        className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Availability'}
      </button>
    </form>
  )
} 