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
  // Bypass rate limit for balkanski.net emails
  if (email.endsWith('@balkanski.net')) {
    return { limited: false };
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Check both email and IP limits
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
    return { 
      limited: true, 
      message: 'You have reached your monthly limit for free meetups',
      upgradeInfo: {
        currentPlan: 'free',
        currentLimit: MONTHLY_LIMIT,
        proLimit: 'unlimited',
        upgradeUrl: '/upgrade'
      }
    };
  }

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
    return { 
      limited: true, 
      message: 'You have reached your monthly limit for free meetups',
      upgradeInfo: {
        currentPlan: 'free',
        currentLimit: MONTHLY_LIMIT,
        proLimit: 'unlimited',
        upgradeUrl: '/upgrade'
      }
    };
  }

  return { limited: false };
}

async function updateRateLimits(email: string, ip: string) {
  // Don't update limits for balkanski.net emails
  if (email.endsWith('@balkanski.net')) {
    return;
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Update email rate limit only
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

  // Remove IP rate limit update
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, description, creatorEmail: email, startDate, endDate, startTime, endTime, useTimeRanges } = data;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    console.log('Checking rate limits for:', { email, ip });
    
    // Check rate limits
    const rateLimitCheck = await checkRateLimit(email, ip);
    if (rateLimitCheck.limited) {
      console.log('Rate limit exceeded:', rateLimitCheck.message);
      return NextResponse.json(
        { 
          error: rateLimitCheck.message,
          upgradeInfo: rateLimitCheck.upgradeInfo
        },
        { status: 429 }
      );
    }

    console.log('Creating meetup with data:', {
      title,
      description,
      email,
      startDate,
      endDate,
      startTime,
      endTime,
      useTimeRanges
    });

    const meetup = await prisma.meetUp.create({
      data: {
        title,
        description,
        createdBy: email,
        useTimeRanges: useTimeRanges ?? true,
        timeSlots: {
          create: generateTimeSlots(
            new Date(startDate), 
            new Date(endDate), 
            useTimeRanges ? startTime : undefined, 
            useTimeRanges ? endTime : undefined
          )
        }
      },
      include: {
        timeSlots: true
      }
    });

    console.log('Created meetup:', {
      id: meetup.id,
      slotCount: meetup.timeSlots.length,
      useTimeRanges: meetup.useTimeRanges
    });

    const meetupUrl = `${APP_URL}/meetup/${meetup.id}`;

    try {
      // Get current usage count
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      const emailLimit = await prisma.rateLimit.findUnique({
        where: {
          identifier_type_month_year: {
            identifier: email,
            type: 'email',
            month: currentMonth,
            year: currentYear,
          },
        },
      })

      // Send email to creator using the new template
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Your Meetup: ${title}`,
        react: CreatorMeetupEmail({
          meetupUrl,
          meetupTitle: title,
          usageCount: emailLimit?.count || 0,
          monthlyLimit: MONTHLY_LIMIT
        })
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json({
        ...meetup,
        warning: 'Meetup created but failed to send email notification'
      });
    }

    // Update rate limits after successful creation
    console.log('Updating rate limits');
    await updateRateLimits(email, ip);
    console.log('Rate limits updated successfully');

    return NextResponse.json(meetup);
  } catch (error) {
    console.error('Failed to create meetup:', error);
    // Return more detailed error information in development
    return NextResponse.json(
      { 
        error: 'Failed to create meetup',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
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
  
  console.log('Generated slots:', slots.length, 'useTimeRanges:', !!startTime)
  return slots
} 