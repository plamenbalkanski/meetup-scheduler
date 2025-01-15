'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
}

interface MeetUp {
  id: string
  useTimeRanges: boolean
  timeSlots: TimeSlot[]
}

export function ResponseForm({ meetupId }: { meetupId: string }) {
  const [loading, setLoading] = useState(false)
  const [meetup, setMeetup] = useState<MeetUp | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [name, setName] = useState('')

  useEffect(() => {
    const fetchMeetup = async () => {
      try {
        const response = await fetch(`/api/meetups/${meetupId}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setMeetup(data)
      } catch (error) {
        toast.error('Failed to load meetup details')
        console.error('Error:', error)
      }
    }
    fetchMeetup()
  }, [meetupId])

  const formatSlot = (slot: TimeSlot) => {
    const date = new Date(slot.startTime)
    if (!meetup?.useTimeRanges) {
      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }),
        time: 'Select Day'
      }
    }
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: 'numeric' })
    }
  }

  const toggleSlot = (slotId: string) => {
    const newSelected = new Set(selectedSlots)
    if (selectedSlots.has(slotId)) {
      newSelected.delete(slotId)
    } else {
      newSelected.add(slotId)
    }
    setSelectedSlots(newSelected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetupId,
          name,
          selectedTimeSlots: Array.from(selectedSlots)
        }),
      })

      // Add timeout handling
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 30000)
      )
      
      const data = await Promise.race([
        response.json(),
        timeoutPromise
      ])

      if (!response.ok) throw new Error(data.error)
      
      toast.success('Response submitted successfully!')
      // Optional: redirect or clear form
      setSelectedSlots(new Set())
      setName('')
    } catch (error: any) {
      if (error.message === 'Request timed out') {
        toast.error('Server is taking longer than usual. Please try again.')
      } else {
        toast.error('Failed to submit response')
      }
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Your Name <span className="text-red-500">*</span>
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

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {meetup?.timeSlots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => toggleSlot(slot.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedSlots.has(slot.id)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{formatSlot(slot).date}</div>
            <div className="text-sm text-gray-500 mt-1">{formatSlot(slot).time}</div>
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || selectedSlots.size === 0}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Response'
        )}
      </button>
    </form>
  )
} 