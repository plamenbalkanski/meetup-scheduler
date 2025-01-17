'use client'

import { useState } from 'react'
import { DateRangePicker } from './DateRangePicker'
import { TimeRangeSelector } from './TimeRangeSelector'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import type { DateRange } from 'react-day-picker'
import { DayPicker } from 'react-day-picker'
import { Switch } from "@/components/ui/switch"
import { Modal } from './ui/Modal'

export function CreateMeetupForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [creatorEmail, setCreatorEmail] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [loading, setLoading] = useState(false)
  const [timeError, setTimeError] = useState<string | null>(null)
  const [useTimeRanges, setUseTimeRanges] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState<any>(null)
  const [address, setAddress] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateRange?.from || !dateRange?.to) return

    setLoading(true)
    try {
      const response = await fetch('/api/meetups', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title,
          address,
          creatorEmail,
          startDate: dateRange.from,
          endDate: dateRange.to,
          startTime: useTimeRanges ? startTime : undefined,
          endTime: useTimeRanges ? endTime : undefined,
          useTimeRanges,
        }),
      })

      let data
      try {
        const text = await response.text()
        data = JSON.parse(text)
        console.log('Response data:', data)
      } catch (e) {
        console.error('Failed to parse response:', e)
        throw new Error('Invalid server response')
      }

      if (!response.ok) {
        if (response.status === 429 && data.showUpgradeModal) {
          setShowUpgradeModal(true)
          return
        }
        throw new Error(data.error || 'Failed to create meetup')
      }

      toast.success('Meetup created! Check your email for the details.')
      window.location.href = `/meetup/${data.id}`
    } catch (error: any) {
      toast.error(error.message || 'Failed to create meetup')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
        <div>
          <label htmlFor="title" className="block text-lg font-medium text-gray-900">
            What's your meetup about?
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
            required
            placeholder="e.g., Team Planning Session, Project Review..."
          />
        </div>

        <div>
          <label htmlFor="creatorEmail" className="block text-lg font-medium text-gray-900">
            Your email
          </label>
          <p className="text-sm text-gray-500 mb-2">We'll send you a confirmation with the meetup link</p>
          <input
            type="email"
            id="creatorEmail"
            value={creatorEmail}
            onChange={(e) => setCreatorEmail(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-lg font-medium text-gray-900">
            Location <span className="text-sm font-normal text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Conference Room A, or Coffee Shop address"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-900 mb-2">
            When could this happen?
          </label>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          {!dateRange?.from && !dateRange?.to && (
            <p className="mt-1 text-sm text-gray-500">Select possible dates for your meetup</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Specific time slots?</h3>
              <p className="text-sm text-gray-500">Toggle to specify hours instead of full days</p>
            </div>
            <Switch
              id="time-ranges"
              checked={useTimeRanges}
              onCheckedChange={setUseTimeRanges}
            />
          </div>

          {useTimeRanges && (
            <div className="mt-4">
              <TimeRangeSelector
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
                onValidationError={setTimeError}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !title || !dateRange?.from || !dateRange?.to || !!timeError}
          className="w-full py-3 px-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating your meetup...
            </span>
          ) : (
            'Create Meetup'
          )}
        </button>
      </form>

      <Modal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Monthly Limit Reached
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            You've reached the monthly limit for creating meetups. Upgrade to Pro for unlimited meetups!
          </p>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowUpgradeModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUpgradeModal(false)
                window.location.href = '/upgrade'
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
} 