import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get meetup ID from URL
    const { searchParams } = new URL(request.url);
    const meetupId = searchParams.get('id');

    if (!meetupId) {
      return NextResponse.json(
        { error: 'Meetup ID is required' },
        { status: 400 }
      );
    }

    const meetup = await prisma.meetUp.findUnique({
      where: { id: meetupId },
      include: {
        timeSlots: {
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    });

    if (!meetup) {
      return NextResponse.json(
        { error: 'Meetup not found' },
        { status: 404 }
      );
    }

    // Format the time slots
    const formattedMeetup = {
      ...meetup,
      timeSlots: meetup.timeSlots.map(slot => {
        const slotDate = new Date(slot.startTime);
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
        };
      })
    };

    return NextResponse.json(formattedMeetup);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 