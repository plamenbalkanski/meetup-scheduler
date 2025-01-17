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

    // Check rate limit unless it's the test email
    if (rateLimitCount >= DAILY_LIMIT && !isFeatureEnabled('UNLIMITED_MEETUPS') && email !== TEST_EMAIL) {
      return NextResponse.json(
        { 
          error: 'Daily limit reached. Please upgrade for unlimited meetups.',
          showUpgradeModal: true  // Add this flag for the frontend
        },
        { status: 429 }
      )
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