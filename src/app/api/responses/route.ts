import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const startTime = performance.now();
    const data = await request.json();
    
    console.log(`Request received after ${performance.now() - startTime}ms`);
    
    // Process the response data
    const { meetupId, name, selectedTimeSlots } = data;
    
    if (!meetupId || !name || !selectedTimeSlots) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the response in the database
    const newResponse = await prisma.response.create({
      data: {
        meetUpId: meetupId,
        name: name,
        timeSlots: {
          connect: selectedTimeSlots.map((id: string) => ({ id }))
        }
      }
    });
    
    console.log(`Response processed in ${performance.now() - startTime}ms`);
    return NextResponse.json(newResponse);
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    );
  }
} 