'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function ShareMeetup({ meetupId }: { meetupId: string }) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [remaining, setRemaining] = useState<{ hourly: number; daily: number } | null>(null)

  const meetupUrl = `${window.location.origin}/meetup/${meetupId}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(meetupUrl)
    toast.success('Link copied to clipboard!')
  }

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    
    try {
      const response = await fetch('/api/share-meetup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, meetupUrl, meetupId }),
      })
      
      const data = await response.json()
      
      if (response.status === 429) {
        toast.error(data.error)
        setRemaining(data.remaining)
      } else if (response.ok) {
        toast.success('Invitation sent!')
        setRemaining(data.remaining)
        setEmail('')
        setShowEmailForm(false)
      } else {
        throw new Error(data.error || 'Failed to send email')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Share this meetup</h2>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={copyLink}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Copy Link
        </button>
        
        <button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Share via Email
        </button>
      </div>

      {showEmailForm && (
        <form onSubmit={sendEmail} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Invitation'}
          </button>
        </form>
      )}

      {remaining && (
        <div className="mt-2 text-sm text-gray-600">
          Remaining attempts: {remaining.hourly} this hour / {remaining.daily} today
        </div>
      )}
    </div>
  )
} 