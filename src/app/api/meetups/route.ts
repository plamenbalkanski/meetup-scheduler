import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend } from '../../../lib/resend'
import { render } from '@react-email/render'
import { CreatorMeetupEmail } from '../../../emails/CreatorMeetupEmail'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.warn('NEXT_PUBLIC_APP_URL environment variable is not set, using fallback URL')
}

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY environment variable is not set')
}

const FROM_EMAIL = 'plamen@balkanski.net'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://meetup-scheduler.onrender.com'

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

if (!isValidUrl(APP_URL)) {
  console.error(`Invalid APP_URL format: ${APP_URL}`)
}

const MONTHLY_LIMIT = 3;

async function checkRateLimit(email: string, ip: string) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Check email limit
  const emailLimit = await prisma.rateLimit.findUnique({
    where: {
      identifier_type_month_year: {
        identifier: email,
        type: 'email',
        month: currentMonth,
        year: currentYear,
      },
    },
  });

  if (emailLimit && emailLimit.count >= MONTHLY_LIMIT) {
    return { limited: true, message: 'Monthly limit exceeded for this email address' };
  }

  // Check IP limit
  const ipLimit = await prisma.rateLimit.findUnique({
    where: {
      identifier_type_month_year: {
        identifier: ip,
        type: 'ip',
        month: currentMonth,
        year: currentYear,
      },
    },
  });

  if (ipLimit && ipLimit.count >= MONTHLY_LIMIT) {
    return { limited: true, message: 'Monthly limit exceeded for this IP address' };
  }

  return { limited: false };
}

async function updateRateLimits(email: string, ip: string) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Update email rate limit
  await prisma.rateLimit.upsert({
    where: {
      identifier_type_month_year: {
        identifier: email,
        type: 'email',
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      identifier: email,
      type: 'email',
      month: currentMonth,
      year: currentYear,
      count: 1,
    },
  });

  // Update IP rate limit
  await prisma.rateLimit.upsert({
    where: {
      identifier_type_month_year: {
        identifier: ip,
        type: 'ip',
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      identifier: ip,
      type: 'ip',
      month: currentMonth,
      year: currentYear,
      count: 1,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email } = data;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    // Check rate limits
    const rateLimitCheck = await checkRateLimit(email, ip);
    if (rateLimitCheck.limited) {
      return NextResponse.json(
        { error: rateLimitCheck.message },
        { status: 429 }
      );
    }

    const { title, description, creatorEmail, startDate, endDate, startTime, endTime } = data;

    // Validate required environment variables at runtime
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Email service is not configured')
    }

    if (!isValidUrl(APP_URL)) {
      throw new Error('Invalid application URL configuration')
    }

    const meetup = await prisma.meetUp.create({
      data: {
        title,
        description,
        createdBy: creatorEmail,
        timeSlots: {
          create: generateTimeSlots(new Date(startDate), new Date(endDate), startTime, endTime)
        }
      }
    })

    const meetupUrl = `${APP_URL}/meetup/${meetup.id}`

    try {
      // Send email to creator using the new template
      await resend.emails.send({
        from: FROM_EMAIL,
        to: creatorEmail,
        subject: `Your Meetup: ${title}`,
        html: render(CreatorMeetupEmail({
          meetupUrl,
          meetupTitle: title
        }))
      })
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Continue execution but notify the user
      return NextResponse.json({
        ...meetup,
        warning: 'Meetup created but failed to send email notification'
      })
    }

    // Update rate limits after successful creation
    await updateRateLimits(email, ip);

    return NextResponse.json(meetup)
  } catch (error) {
    console.error('Failed to create meetup:', error)
    return NextResponse.json(
      { error: 'Failed to create meetup' },
      { status: 500 }
    )
  }
}

function generateTimeSlots(startDate: Date, endDate: Date, startTime: string, endTime: string) {
  const slots = []
  const currentDate = new Date(startDate)
  
  const [startHour] = startTime.split(':').map(Number)
  const [endHour] = endTime.split(':').map(Number)
  
  while (currentDate <= endDate) {
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        startTime: new Date(new Date(currentDate).setHours(hour, 0, 0)),
        endTime: new Date(new Date(currentDate).setHours(hour + 1, 0, 0))
      })
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return slots
} 