import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { checkRateLimit } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import { MeetupInvite } from '@/emails/MeetupInvite'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, meetupUrl, meetupId } = await request.json()

    // Check rate limits
    const rateLimitCheck = await checkRateLimit(email)
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: 429 }
      )
    }

    // Get meetup details
    const meetup = await prisma.meetUp.findUnique({
      where: { id: meetupId },
      select: { title: true }
    })

    if (!meetup) {
      return NextResponse.json(
        { error: 'Meetup not found' },
        { status: 404 }
      )
    }

    // Send email with tracking
    const emailHtml = render(
      MeetupInvite({
        meetupUrl,
        meetupTitle: meetup.title
      })
    )

    const { data: emailData } = await resend.emails.send({
      from: 'Meetup Scheduler <onboarding@resend.dev>',
      to: email,
      subject: `Availability Request: ${meetup.title}`,
      html: emailHtml,
      tags: [{ name: 'meetupId', value: meetupId }],
      track_opens: true,
      track_clicks: true
    })

    return NextResponse.json({ 
      success: true,
      messageId: emailData?.id 
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 