import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/features'

const TEST_EMAIL = process.env.TEST_EMAIL || 'plamen@balkanski.net'
const MONTHLY_LIMIT = 3

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email, ip } = data

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

      console.log('Rate limit count:', rateLimitCount)

      if (rateLimitCount >= MONTHLY_LIMIT && !isFeatureEnabled('UNLIMITED_MEETUPS')) {
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

    // Create meetup for all users
    const meetup = await prisma.meetUp.create({
      data: {
        ...data,
        timeSlots: {
          create: data.timeSlots
        }
      }
    })

    // Record rate limit usage only for non-test emails
    if (email !== TEST_EMAIL) {
      await prisma.rateLimit.create({
        data: {
          identifier: email,
          type: 'email',
          count: 1,
          month,
          year
        }
      })

      await prisma.rateLimit.create({
        data: {
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