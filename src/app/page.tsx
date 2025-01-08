import CreateMeetupForm from '../components/CreateMeetupForm'
import { CalendarDays, Share, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">
        Meetup Scheduler
      </h1>

      <div className="mb-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">How it Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">Create a Meetup</h3>
            <p className="text-gray-600 text-sm">
              Set up your meetup with available dates and times
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">Share the Link</h3>
            <p className="text-gray-600 text-sm">
              Get a link to share with your participants
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">Find the Best Time</h3>
            <p className="text-gray-600 text-sm">
              See when everyone is available
            </p>
          </div>
        </div>
      </div>

      <CreateMeetupForm />
    </main>
  )
} 