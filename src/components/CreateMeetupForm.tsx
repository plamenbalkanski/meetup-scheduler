'use client'

import { useState } from 'react'
import { DateRangePicker } from './DateRangePicker'
import { TimeRangeSelector } from './TimeRangeSelector'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import type { DateRange } from 'react-day-picker'

export default function CreateMeetupForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creatorEmail, setCreatorEmail] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [loading, setLoading] = useState(false)
  const [timeError, setTimeError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateRange?.from || !dateRange?.to) return

    setLoading(true)
    try {
      const response = await fetch('/api/meetups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          creatorEmail,
          startDate: dateRange.from,
          endDate: dateRange.to,
          startTime,
          endTime,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      router.push(`/meetup/${data.id}`)
      toast.success('Meetup created! Check your email for the details.')
    } catch (error) {
      toast.error('Failed to create meetup')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Meetup Title <span className="text-red-500">*</span>
          <span className="text-gray-500 text-xs ml-1">(required)</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
          placeholder="Enter meetup title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
          <span className="text-gray-500 text-xs ml-1">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={3}
          placeholder="Add a description for your meetup"
        />
      </div>

      <div>
        <label htmlFor="creatorEmail" className="block text-sm font-medium">
          Your Email <span className="text-red-500">*</span>
          <span className="text-gray-500 text-xs ml-1">(required)</span>
        </label>
        <input
          type="email"
          id="creatorEmail"
          value={creatorEmail}
          onChange={(e) => setCreatorEmail(e.target.value)}
          placeholder="We'll send you the meetup details"
          className="mt-1 w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Select Date Range <span className="text-red-500">*</span>
          <span className="text-gray-500 text-xs ml-1">(required)</span>
        </label>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
        {!dateRange?.from && !dateRange?.to && (
          <p className="mt-1 text-sm text-gray-500">Please select start and end dates</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Select Time Range <span className="text-red-500">*</span>
          <span className="text-gray-500 text-xs ml-1">(required)</span>
        </label>
        <TimeRangeSelector
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onValidationError={setTimeError}
        />
        {timeError && (
          <p className="mt-1 text-sm text-red-600">{timeError}</p>
        )}
      </div>

      <div className="text-sm text-gray-500 mt-4">
        <p>Fields marked with <span className="text-red-500">*</span> are required</p>
      </div>

      <button
        type="submit"
        disabled={loading || !title || !dateRange?.from || !dateRange?.to || !!timeError}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </span>
        ) : (
          'Create Meetup'
        )}
      </button>
    </form>
  )
} 