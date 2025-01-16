import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get meetup ID from URL and log it
    const { searchParams } = new URL(request.url)
    const meetupId = searchParams.get('id')
    console.log('API hit with meetupId:', meetupId)

    if (!meetupId) {
      console.log('No meetup ID provided')
      return NextResponse.json(
        { error: 'Meetup ID is required' },
        { status: 400 }
      )
    }

    // Log the query we're about to make
    console.log('Querying database for meetup:', meetupId)
    
    const meetup = await prisma.meetUp.findUnique({
      where: { id: meetupId },
      include: {
        timeSlots: {
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    })

    console.log('Database response:', {
      found: !!meetup,
      timeSlots: meetup?.timeSlots?.length
    })

    if (!meetup) {
      return NextResponse.json(
        { error: 'Meetup not found' },
        { status: 404 }
      )
    }

    // Format and return the meetup
    const formattedMeetup = {
      ...meetup,
      timeSlots: meetup.timeSlots.map(slot => {
        const slotDate = new Date(slot.startTime)
        return {
          ...slot,
          startTime: slotDate.toISOString(),
          endTime: new Date(slot.endTime).toISOString(),
          displayTime: meetup.useTimeRanges 
            ? slotDate.toLocaleTimeString([], { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true 
              })
            : 'All Day'
        }
      })
    }

    return NextResponse.json(formattedMeetup)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 