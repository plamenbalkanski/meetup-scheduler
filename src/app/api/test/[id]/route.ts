import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const meetup = await prisma.meetUp.findUnique({
    where: { id: params.id }
  })

  return NextResponse.json({
    raw: meetup,
    check: {
      hasAddress: Boolean(meetup?.address),
      addressValue: meetup?.address,
      id: meetup?.id
    }
  })
} 