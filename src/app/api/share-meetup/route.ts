import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { checkRateLimit } from '../../../lib/rateLimit'
import { prisma } from '../../../lib/prisma'

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

    // Send email
    const { data: emailData } = await resend.emails.send({
      from: 'Meetup Scheduler <onboarding@resend.dev>',
      to: email,
      subject: `Availability Request: ${meetup.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Meeting Availability Request</h1>
          <p>You've been invited to select your availability for: ${meetup.title}</p>
          <p>Click the button below to select your available times:</p>
          <a 
            href="${meetupUrl}"
            style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;"
          >
            Select Your Availability
          </a>
          <p style="color: #666;">
            Or copy this link: <br/>
            <a href="${meetupUrl}">${meetupUrl}</a>
          </p>
        </div>
      `,
      tags: [{ name: 'meetupId', value: meetupId }]
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