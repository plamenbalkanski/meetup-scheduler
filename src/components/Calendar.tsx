'use client'

import { DayPicker, DayPickerSingleProps, DayPickerRangeProps, DayPickerMultipleProps } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

type CalendarProps = {
  mode?: 'single' | 'range' | 'multiple'
  selected?: Date | Date[] | [Date | null, Date | null]
  onSelect?: (date: Date | Date[] | [Date | null, Date | null] | undefined) => void
}

export function Calendar({ mode = 'single', selected, onSelect }: CalendarProps) {
  // Type guard to ensure correct props based on mode
  const getProps = () => {
    switch (mode) {
      case 'single':
        return {
          mode,
          selected: selected as Date,
          onSelect: onSelect as DayPickerSingleProps['onSelect']
        }
      case 'range':
        return {
          mode,
          selected: selected as [Date | null, Date | null],
          onSelect: onSelect as DayPickerRangeProps['onSelect']
        }
      case 'multiple':
        return {
          mode,
          selected: selected as Date[],
          onSelect: onSelect as DayPickerMultipleProps['onSelect']
        }
    }
  }

  return (
    <DayPicker
      {...getProps()}
      className="p-3"
    />
  )
} 