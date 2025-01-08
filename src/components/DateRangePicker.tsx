'use client'

import { useState } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import 'react-day-picker/dist/style.css'

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border rounded-md"
      >
        {value?.from ? (
          value.to ? (
            `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`
          ) : (
            format(value.from, 'MMM d, yyyy')
          )
        ) : (
          'Select dates'
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg">
          <DayPicker
            mode="range"
            selected={value}
            onSelect={(range) => {
              onChange(range)
              if (range?.from && range?.to) setIsOpen(false)
            }}
            numberOfMonths={2}
          />
        </div>
      )}
    </div>
  )
} 