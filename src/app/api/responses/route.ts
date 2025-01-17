import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing meetup ID' },
        { status: 400 }
      )
    }

    const meetup = await prisma.meetUp.findUnique({
      where: { id },
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