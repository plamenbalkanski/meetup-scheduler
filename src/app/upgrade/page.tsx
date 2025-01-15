'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UpgradePage() {
  const router = useRouter()

  useEffect(() => {
    // Track the upgrade page visit
    fetch('/api/analytics/upgrade-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(console.error)
  }, [])

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Coming Soon!</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Pro Features</h2>
          <ul className="text-left space-y-4 mb-8">
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Unlimited meetups per month
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Custom time durations
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Priority support
            </li>
          </ul>

          <p className="text-gray-600 mb-8">
            We're working hard to bring you these amazing features. 
            Leave your email to be notified when Pro is available!
          </p>

          <form 
            onSubmit={async (e) => {
              e.preventDefault()
              const email = new FormData(e.currentTarget).get('email')
              
              try {
                await fetch('/api/analytics/upgrade-interest', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                })
                
                alert('Thanks! We\'ll notify you when Pro is available.')
                router.push('/')
              } catch (error) {
                console.error(error)
                alert('Something went wrong. Please try again.')
              }
            }}
            className="max-w-sm mx-auto"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Notify Me
            </button>
          </form>
        </div>

        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Home
        </button>
      </div>
    </main>
  )
} 