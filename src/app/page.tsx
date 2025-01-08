import CreateMeetupForm from '@/components/CreateMeetupForm'

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">
        Meetup Scheduler
      </h1>
      <CreateMeetupForm />
    </main>
  )
} 