import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    
    await prisma.upgradeAnalytics.create({
      data: {
        type: 'PAGE_VIEW',
        ip,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to track upgrade view:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
} 