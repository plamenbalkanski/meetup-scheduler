'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link as LinkIcon } from 'lucide-react'

export default function ShareMeetup({ meetupId }: { meetupId: string }) {
  const meetupUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/meetup/${meetupId}`
    : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(meetupUrl)
    toast.success('Link copied to clipboard!')
  }

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Share this meetup</h2>
      
      <button
        onClick={copyLink}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <LinkIcon className="w-4 h-4" />
        Copy Link
      </button>

      <p className="mt-4 text-sm text-gray-600">
        Share this link with your participants to let them select their availability
      </p>
    </div>
  )
} 