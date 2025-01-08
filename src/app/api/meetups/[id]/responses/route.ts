import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, timeSlotIds } = await request.json()

    const response = await prisma.response.create({
      data: {
        name,
        meetUpId: params.id,
        timeSlots: {
          connect: timeSlotIds.map((id: string) => ({ id }))
        }
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to submit response:', error)
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    )
  }
} 