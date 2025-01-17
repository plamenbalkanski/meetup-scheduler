import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetup = await prisma.meetUp.findUnique({
      where: { id: params.id },
      include: {
        timeSlots: {
          include: {
            responses: true
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

    return NextResponse.json(meetup)
  } catch (error) {
    console.error('Failed to fetch meetup:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meetup' },
      { status: 500 }
    )
  }
} 