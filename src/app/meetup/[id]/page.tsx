import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import AvailabilitySelector from '@/components/AvailabilitySelector'
import ShareMeetup from '@/components/ShareMeetup'
import ResultsView from '@/components/ResultsView'
import { Suspense } from 'react'

export default async function MeetupPage({ params }: { params: { id: string } }) {
  const meetup = await prisma.meetUp.findUnique({
    where: { id: params.id },
    include: {
      timeSlots: {
        include: {
          responses: true
        }
      },
      responses: true
    }
  })

  if (!meetup) {
    notFound()
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      {/* Title Section */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">{meetup.title}</h1>
        {meetup.description && (
          <p className="text-gray-600 mb-4">{meetup.description}</p>
        )}
      </div>

      {/* Grid layout for Share, Location, and Results */}
      <div className="grid gap-8 md:grid-cols-2 mb-8">
        {/* Left column: Share and Location */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Share</h2>
            <ShareMeetup meetupId={meetup.id} />
          </div>

          {/* Location Section - Always under Share */}
          {meetup.address && (
            <div>
              <h2 className="text-lg font-medium mb-3">Location</h2>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetup.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{meetup.address}</span>
              </a>
            </div>
          )}
        </div>
        
        {/* Right column: Results */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <Suspense fallback={<ResultsSkeleton />}>
            <ResultsView meetup={meetup} />
          </Suspense>
        </div>
      </div>

      {/* Availability Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Select Your Availability</h2>
        <AvailabilitySelector meetup={meetup} />
      </div>
    </main>
  )
}

function ResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
} 