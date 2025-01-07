'use client'

import { useState } from 'react'
import { Calendar } from './Calendar'
import { format } from 'date-fns'

interface DateRangePickerProps {
  value: [Date | null, Date | null]
  onChange: (value: [Date | null, Date | null]) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [startDate, endDate] = value
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border rounded-md"
      >
        {startDate && endDate ? (
          `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
        ) : (
          'Select dates'
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg">
          <Calendar
            mode="range"
            selected={value}
            onSelect={(dates) => {
              onChange(dates as [Date | null, Date | null])
              if (dates[0] && dates[1]) setIsOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
} 