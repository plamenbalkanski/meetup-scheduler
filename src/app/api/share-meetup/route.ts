import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, meetupUrl, meetupId } = await request.json()

    await resend.emails.send({
      from: 'meetup@yourdomain.com',
      to: email,
      subject: 'You\'ve been invited to select your availability',
      html: `
        <h1>Meeting Availability Request</h1>
        <p>You've been invited to select your availability for a meeting.</p>
        <p>Click the link below to select your available times:</p>
        <a href="${meetupUrl}">${meetupUrl}</a>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 