import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import { render } from '@react-email/render'
import { CreatorMeetupEmail } from '@/emails/CreatorMeetupEmail'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes timeout

export async function POST(request: NextRequest) {
  try {
    // Add error handling for request parsing
    let data
    try {
      data = await request.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    console.log('Creating meetup with data:', data)
    
    // Validate required fields
    const { title, description, address, creatorEmail, startDate, endDate, useTimeRanges, startTime, endTime } = data
    
    if (!title || !creatorEmail || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the meetup
    const meetup = await prisma.meetUp.create({
      data: {
        title,
        description,
        address,
        createdBy: creatorEmail,
        useTimeRanges: useTimeRanges ?? false,
        timeSlots: {
          create: generateTimeSlots(
            new Date(startDate),
            new Date(endDate),
            startTime,
            endTime
          )
        }
      }
    })

    console.log('Meetup created:', meetup)

    // Send email
    try {
      const emailHtml = render(
        CreatorMeetupEmail({
          id: meetup.id,
          title: meetup.title
        })
      )

      console.log('Sending email to:', creatorEmail)
      
      const email = await resend.emails.send({
        from: 'Meetup Scheduler <meetup@balkanski.net>',
        to: creatorEmail,
        subject: `Your meetup "${meetup.title}" has been created`,
        html: emailHtml
      })

      console.log('Email sent:', email)
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Don't throw here, just log the error
    }

    // Return success response
    return NextResponse.json(meetup, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })

  } catch (error) {
    console.error('Failed to create meetup:', error)
    return NextResponse.json(
      { error: 'Failed to create meetup' },
      { status: 500 }
    )
  }
}

function generateTimeSlots(startDate: Date, endDate: Date, startTime?: string, endTime?: string) {
  const slots = []
  const currentDate = new Date(startDate)
  
  // Make sure we're working with clean dates (no time component for comparison)
  const endDateClean = new Date(endDate)
  endDateClean.setHours(23, 59, 59, 999)
  
  while (currentDate <= endDateClean) {
    if (startTime && endTime) {
      // Time slots for specific hours
      const [startHour] = startTime.split(':').map(Number)
      const [endHour] = endTime.split(':').map(Number)
      
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push({
          startTime: new Date(new Date(currentDate).setHours(hour, 0, 0)),
          endTime: new Date(new Date(currentDate).setHours(hour + 1, 0, 0))
        })
      }
    } else {
      // Full day slots
      const slotDate = new Date(currentDate)
      slots.push({
        startTime: new Date(slotDate.setHours(0, 0, 0, 0)),
        endTime: new Date(slotDate.setHours(23, 59, 59, 999))
      })
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  console.log('Generated slots:', slots.length, 'useTimeRanges:', !!startTime)
  return slots
} 