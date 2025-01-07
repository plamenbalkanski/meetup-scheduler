'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import type { MeetUp, TimeSlot } from '@prisma/client'

interface Props {
  meetup: MeetUp & {
    timeSlots: (TimeSlot & {
      responses: { name: string }[]
    })[]
  }
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

  // Group time slots by date
  const slotsByDate = meetup.timeSlots.reduce((acc, slot) => {
    const date = format(new Date(slot.startTime), 'yyyy-MM-dd')
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {} as Record<string, typeof meetup.timeSlots>)

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
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
    </div>
  )
} 