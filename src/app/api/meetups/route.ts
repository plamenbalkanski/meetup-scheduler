import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { resend } from '../../../lib/resend'
import { render } from '@react-email/render'
import { CreatorMeetupEmail } from '../../../emails/CreatorMeetupEmail'

export async function POST(request: Request) {
  try {
    const { title, description, creatorEmail, startDate, endDate, startTime, endTime } = await request.json()

    const meetup = await prisma.meetUp.create({
      data: {
        title,
        description,
        createdBy: creatorEmail,
        timeSlots: {
          create: generateTimeSlots(new Date(startDate), new Date(endDate), startTime, endTime)
        }
      }
    })

    const meetupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meetup/${meetup.id}`

    // Send email to creator using the new template
    await resend.emails.send({
      from: 'Meetup Scheduler <onboarding@resend.dev>',
      to: creatorEmail,
      subject: `Your Meetup: ${title}`,
      html: render(CreatorMeetupEmail({
        meetupUrl,
        meetupTitle: title
      }))
    })

    return NextResponse.json(meetup)
  } catch (error) {
    console.error('Failed to create meetup:', error)
    return NextResponse.json(
      { error: 'Failed to create meetup' },
      { status: 500 }
    )
  }
}

function generateTimeSlots(startDate: Date, endDate: Date, startTime: string, endTime: string) {
  const slots = []
  const currentDate = new Date(startDate)
  
  const [startHour] = startTime.split(':').map(Number)
  const [endHour] = endTime.split(':').map(Number)
  
  while (currentDate <= endDate) {
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        startTime: new Date(new Date(currentDate).setHours(hour, 0, 0)),
        endTime: new Date(new Date(currentDate).setHours(hour + 1, 0, 0))
      })
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return slots
} 