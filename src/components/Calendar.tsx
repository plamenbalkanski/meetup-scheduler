'use client'

import { DayPicker, DayPickerSingleProps, DayPickerRangeProps, DayPickerMultipleProps, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

type CalendarProps = {
  mode?: 'single' | 'range' | 'multiple'
  selected?: Date | Date[] | DateRange | undefined
  onSelect?: (date: Date | Date[] | DateRange | undefined) => void
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
          selected: selected as DateRange,
          onSelect: onSelect as DayPickerRangeProps['onSelect']
        }
      case 'multiple':
        return {
          mode,
          selected: selected as Date[],
          onSelect: onSelect as DayPickerMultipleProps['onSelect']
        }
      default:
        return {
          mode: 'single' as const,
          selected: selected as Date,
          onSelect: onSelect as DayPickerSingleProps['onSelect']
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