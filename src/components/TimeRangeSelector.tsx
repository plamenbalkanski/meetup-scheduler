'use client'

interface TimeRangeProps {
  startTime: string
  endTime: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  onValidationError?: (error: string | null) => void
}

export function TimeRangeSelector({ 
  startTime, 
  endTime, 
  onStartTimeChange, 
  onEndTimeChange,
  onValidationError 
}: TimeRangeProps) {
  const validateTimeRange = (start: string, end: string) => {
    const [startHour] = start.split(':').map(Number)
    const [endHour] = end.split(':').map(Number)
    
    if (endHour - startHour < 1) {
      onValidationError?.('Time range must be at least 1 hour')
      return false
    }
    if (endHour - startHour > 12) {
      onValidationError?.('Time range cannot exceed 12 hours')
      return false
    }
    onValidationError?.(null)
    return true
  }

  const handleStartTimeChange = (time: string) => {
    if (validateTimeRange(time, endTime)) {
      onStartTimeChange(time)
    }
  }

  const handleEndTimeChange = (time: string) => {
    if (validateTimeRange(startTime, time)) {
      onEndTimeChange(time)
    }
  }

  // Generate time options from 7 AM to 10 PM
  const timeOptions = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7
    const time = `${hour.toString().padStart(2, '0')}:00`
    return time
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <select
            value={startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {timeOptions.map((time) => (
              <option 
                key={time} 
                value={time}
                disabled={time >= endTime}
              >
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">End Time</label>
          <select
            value={endTime}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {timeOptions.map((time) => (
              <option 
                key={time} 
                value={time}
                disabled={time <= startTime}
              >
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Selected range: {startTime} - {endTime} ({parseInt(endTime) - parseInt(startTime)} hours)
      </div>
    </div>
  )
} 