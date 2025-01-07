'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import type { MeetUp, TimeSlot, Response } from '@prisma/client'

interface Props {
  meetup: MeetUp & {
    timeSlots: (TimeSlot & {
      responses: (Response & { name: string })[]
    })[]
  }
}

type SlotWithAvailability = TimeSlot & {
  responses: (Response & { name: string })[]
  availabilityCount: number
  availableUsers: string[]
}

export default function ResultsView({ meetup }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bestTimes, setBestTimes] = useState<SlotWithAvailability[]>([])

  useEffect(() => {
    analyzeTimes()
  }, [meetup])

  const analyzeTimes = () => {
    try {
      setLoading(true)
      const slotsWithAvailability = meetup.timeSlots.map(slot => ({
        ...slot,
        availabilityCount: slot.responses.length,
        availableUsers: slot.responses.map(r => r.name)
      }))

      // Sort by number of available people (descending)
      const sorted = slotsWithAvailability
        .sort((a, b) => b.availabilityCount - a.availabilityCount)
        .filter(slot => slot.availabilityCount > 0)

      setBestTimes(sorted)
      setError(null)
    } catch (err) {
      setError('Failed to analyze availability')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border-l-4 border-red-500 bg-red-50">
        <p className="text-red-700">{error}</p>
        <button
          onClick={analyzeTimes}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    )
  }

  if (bestTimes.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <p className="text-center text-gray-600">
          No availability submitted yet
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Best Meeting Times</h2>
      
      {bestTimes.map(slot => (
        <div
          key={slot.id}
          className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {format(new Date(slot.startTime), 'EEEE, MMMM d')}
              </h3>
              <p className="text-lg">
                {format(new Date(slot.startTime), 'h:mm a')} - 
                {format(new Date(slot.endTime), 'h:mm a')}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full">
                {slot.availabilityCount} available
              </span>
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-gray-600">Available people:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {slot.availableUsers.map(name => (
                <span
                  key={name}
                  className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 