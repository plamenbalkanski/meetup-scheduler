'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  displayTime?: string
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
        console.log('Fetching meetup:', meetupId)
        const response = await fetch(`/api/responses?id=${meetupId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Response error:', {
            status: response.status,
            text: errorText,
            meetupId
          })
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Meetup data:', data)
        setMeetup(data)
      } catch (error) {
        console.error('Fetch error:', error)
        toast.error('Failed to load meetup details')
      }
    }

    if (meetupId) {
      fetchMeetup()
    }
  }, [meetupId])

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
            }`