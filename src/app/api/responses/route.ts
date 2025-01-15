import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const startTime = performance.now();
    const data = await request.json();
    
    console.log(`Request received after ${performance.now() - startTime}ms`);
    
    // Process the response data
    const { meetupId, name, selectedTimeSlots } = data;
    
    if (!meetupId || !name || !selectedTimeSlots) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the response in the database
    const newResponse = await prisma.response.create({
      data: {
        meetUpId: meetupId,
        name: name,
        timeSlots: {
          connect: selectedTimeSlots.map((id: string) => ({ id }))
        }
      }
    });
    
    console.log(`Response processed in ${performance.now() - startTime}ms`);
    return NextResponse.json(newResponse);
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      time: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetup = await prisma.meetUp.findUnique({
      where: { id: params.id },
      include: {
        timeSlots: {
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    })

    if (!meetup) {
      return NextResponse.json(
        { error: 'Meetup not found' },
        { status: 404 }
      )
    }

    // Format the time slots before sending
    const formattedMeetup = {
      ...meetup,
      timeSlots: meetup.timeSlots.map(slot => ({
        ...slot,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        displayTime: meetup.useTimeRanges ? 
          slot.startTime.toLocaleTimeString([], { hour: 'numeric' }) :
          'Select Day'
      }))
    }

    return NextResponse.json(formattedMeetup)
  } catch (error) {
    console.error('Failed to fetch meetup:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meetup' },
      { status: 500 }
    )
  }
} 