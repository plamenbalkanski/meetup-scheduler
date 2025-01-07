'use client'

import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

interface CalendarProps {
  mode?: 'single' | 'range' | 'multiple'
  selected?: Date | Date[] | [Date | null, Date | null]
  onSelect?: (date: Date | Date[] | [Date | null, Date | null]) => void
}

export function Calendar({ mode = 'single', selected, onSelect }: CalendarProps) {
  return (
    <DayPicker
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      className="p-3"
    />
  )
} 