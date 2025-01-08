import { notFound } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import AvailabilitySelector from '../../../components/AvailabilitySelector'
import ShareMeetup from '../../../components/ShareMeetup'
import ResultsView from '../../../components/ResultsView'
import { Suspense } from 'react'

export default async function MeetupPage({
  params: { id }
}: {
  params: { id: string }
}) {
  try {
    const meetup = await prisma.meetUp.findUnique({
      where: { id },
      include: {
        timeSlots: {
          include: {
            responses: {
              include: {
                timeSlots: true
              }
            }
          }
        },
        responses: true
      }
    })

    if (!meetup) notFound()

    return (
      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{meetup.title}</h1>
          {meetup.description && (
            <p className="text-gray-600">{meetup.description}</p>
          )}
        </div>

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
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Select Your Availability</h2>
          <AvailabilitySelector meetup={meetup} />
        </div>
      </main>
    )
  } catch (error) {
    console.error('Failed to load meetup:', error)
    return <ErrorState />
  }
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

function ErrorState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">
          We couldn't load the meetup details
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 