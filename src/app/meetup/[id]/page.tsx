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

      {/* Location Section */}
      <div className="mb-8 border-4 border-blue-500 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Location</h2>
        {meetup.address && (
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetup.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg text-blue-600 hover:bg-blue-100"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5"
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
            <span className="underline">{meetup.address}</span>
          </a>
        )}
      </div>

      {/* Share and Results */}
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Share</h2>
          <ShareMeetup meetupId={meetup.id} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <Suspense fallback={<ResultsSkeleton />}>
            <ResultsView meetup={meetup} />
          </Suspense>
        </div>
      </div>

      {/* Availability Section */}
      <div className="mt-8">
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