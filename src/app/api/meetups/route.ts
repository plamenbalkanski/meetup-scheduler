import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/features'

const TEST_EMAIL = 'plamen@balkanski.net'
const DAILY_LIMIT = 3 // Or whatever limit you want to set

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email, ip } = data

    // Skip rate limit for test email
    if (email !== TEST_EMAIL) {
      // Check rate limit
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const rateLimitCount = await prisma.rateLimit.count({
        where: {
          OR: [
            { createdBy: email },
            { ipAddress: ip }
          ],
          createdAt: {
            gte: today
          }
        }
      })

      // If user has reached daily limit and doesn't have unlimited feature
      if (rateLimitCount >= DAILY_LIMIT && !isFeatureEnabled('UNLIMITED_MEETUPS')) {
        return NextResponse.json(
          { error: 'Daily limit reached. Please upgrade for unlimited meetups.' },
          { status: 429 }
        )
      }
    }

    // Create meetup
    const meetup = await prisma.meetUp.create({
      data: {
        ...data,
        timeSlots: {
          create: data.timeSlots
        }
      }
    })

    // Record rate limit usage (even for test email, for tracking)
    await prisma.rateLimit.create({
      data: {
        createdBy: email,
        ipAddress: ip,
        meetUpId: meetup.id
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