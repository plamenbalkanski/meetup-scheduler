import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/features'

const TEST_EMAIL = process.env.TEST_EMAIL || 'plamen@balkanski.net'
const MONTHLY_LIMIT = 3

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const email = data.creatorEmail
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    // Debug logging
    console.log('Received email:', email)
    console.log('TEST_EMAIL from env:', process.env.TEST_EMAIL)
    console.log('TEST_EMAIL const:', TEST_EMAIL)
    console.log('Is test email?', email === TEST_EMAIL)

    // Get current date info
    const today = new Date()
    const month = today.getMonth() + 1
    const year = today.getFullYear()

    // Only check rate limit for non-test emails
    if (email !== TEST_EMAIL) {
      console.log('Checking rate limit for non-test email')
      const rateLimitSum = await prisma.rateLimit.aggregate({
        where: {
          OR: [
            { identifier: email, type: 'email' },
            { identifier: ip, type: 'ip' }
          ],
          month,
          year,
        },
        _sum: {
          count: true
        }
      })

      const totalCount = rateLimitSum._sum.count || 0
      console.log('Total rate limit count:', totalCount)

      if (totalCount >= MONTHLY_LIMIT && !isFeatureEnabled('UNLIMITED_MEETUPS')) {
        console.log('Rate limit reached')
        return NextResponse.json(
          { 
            error: 'Monthly limit reached. Please upgrade for unlimited meetups.',
            showUpgradeModal: true
          },
          { status: 429 }
        )
      }
    } else {
      console.log('Skipping rate limit for test email')
    }

    // Generate time slots
    const timeSlots = generateTimeSlots(
      new Date(data.startDate),
      new Date(data.endDate),
      data.useTimeRanges ? data.startTime : undefined,
      data.useTimeRanges ? data.endTime : undefined
    )

    // Create meetup for all users
    const meetup = await prisma.meetUp.create({
      data: {
        title: data.title,
        description: data.description,
        address: data.address,
        createdBy: email,
        useTimeRanges: data.useTimeRanges,
        timeSlots: {
          create: timeSlots
        }
      }
    })

    // Record rate limit usage only for non-test emails
    if (email !== TEST_EMAIL) {
      // Update or create email rate limit
      await prisma.rateLimit.upsert({
        where: {
          identifier_type_month_year: {
            identifier: email,
            type: 'email',
            month,
            year
          }
        },
        update: {
          count: {
            increment: 1
          }
        },
        create: {
          identifier: email,
          type: 'email',
          count: 1,
          month,
          year
        }
      })

      // Update or create IP rate limit
      await prisma.rateLimit.upsert({
        where: {
          identifier_type_month_year: {
            identifier: ip,
            type: 'ip',
            month,
            year
          }
        },
        update: {
          count: {
            increment: 1
          }
        },
        create: {
          identifier: ip,
          type: 'ip',
          count: 1,
          month,
          year
        }
      })
    }

    return NextResponse.json(meetup)
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
  
  return slots
} 