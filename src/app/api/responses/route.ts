import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const startTime = performance.now()
    const data = await request.json()
    
    // Add some logging
    console.log(`Request received after ${performance.now() - startTime}ms`)
    
    // Your existing code...
    
    console.log(`Response processed in ${performance.now() - startTime}ms`)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString()
    })
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    )
  }
} 