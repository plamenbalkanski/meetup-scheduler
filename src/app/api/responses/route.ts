import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    console.log('GET /api/responses - Fetching meetup:', id)

    const meetup = await prisma.meetUp.findUnique({
      where: { id: id! },
      include: {
        timeSlots: {
          include: {
            responses: true
          }
        },
        responses: true
      }
    })

    console.log('GET /api/responses - Meetup data:', {
      id: meetup?.id,
      address: meetup?.address,
      timeSlots: meetup?.timeSlots?.length
    })

    if (!meetup) {
      return NextResponse.json(
        { error: 'Meetup not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(meetup)
  } catch (error) {
    console.error('GET /api/responses - Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meetup' },
      { status: 500 }
    )
  }
} 