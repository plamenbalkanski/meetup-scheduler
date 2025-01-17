import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/features'

const TEST_EMAIL = 'plamen@balkanski.net'
const DAILY_LIMIT = 3

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email, ip } = data

    // Get current date info
    const today = new Date()
    const month = today.getMonth() + 1
    const year = today.getFullYear()

    // Skip rate limit for test email
    if (email !== TEST_EMAIL) {
      const rateLimitCount = await prisma.rateLimit.count({
        where: {
          OR: [
            { identifier: email, type: 'email' },
            { identifier: ip, type: 'ip' }
          ],
          month,
          year,
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
        identifier: email,
        type: 'email',
        count: 1,
        month,
        year
      }
    })

    // Also record IP-based rate limit
    await prisma.rateLimit.create({
      data: {
        identifier: ip,
        type: 'ip',
        count: 1,
        month,
        year
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