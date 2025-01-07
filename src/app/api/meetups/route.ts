import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { title, description, startDate, endDate } = await request.json()

    const meetup = await prisma.meetUp.create({
      data: {
        title,
        description,
        createdBy: 'anonymous', // Replace with actual user when auth is added
        timeSlots: {
          create: generateTimeSlots(new Date(startDate), new Date(endDate))
        }
      }
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

function generateTimeSlots(startDate: Date, endDate: Date) {
  const slots = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    // Create slots for 9 AM to 5 PM
    for (let hour = 9; hour < 17; hour++) {
      slots.push({
        startTime: new Date(new Date(currentDate).setHours(hour, 0, 0)),
        endTime: new Date(new Date(currentDate).setHours(hour + 1, 0, 0))
      })
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return slots
} 