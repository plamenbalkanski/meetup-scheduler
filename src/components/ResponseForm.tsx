'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export function ResponseForm() {
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        // ... rest of your fetch code
      })
      
      // Add timeout handling
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 30000)
      )
      
      const data = await Promise.race([
        response.json(),
        timeoutPromise
      ])
      
      if (!response.ok) throw new Error(data.error)
      // ... rest of success handling
    } catch (error: any) {
      if (error.message === 'Request timed out') {
        toast.error('Server is taking longer than usual. Please try again.')
      } else {
        toast.error('Failed to submit response')
      }
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... your form fields ... */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Response'
        )}
      </button>
    </form>
  )
} 