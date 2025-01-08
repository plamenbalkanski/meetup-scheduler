'use client'

import { useState } from 'react'
import { DateRangePicker } from './DateRangePicker'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function CreateMeetupForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateRange[0] || !dateRange[1]) return

    setLoading(true)
    try {
      const response = await fetch('/api/meetups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startDate: dateRange[0],
          endDate: dateRange[1],
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      router.push(`/meetup/${data.id}`)
      toast.success('Meetup created successfully!')
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
          Meetup Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Select Date Range
        </label>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !title || !dateRange[0] || !dateRange[1]}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Meetup'}
      </button>
    </form>
  )
} 