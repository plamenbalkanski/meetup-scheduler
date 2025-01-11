import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { checkRateLimit } from '../../middleware/rateLimitChecker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Wrap the rate limit check in a promise
  await new Promise((resolve) => checkRateLimit(req, res, resolve));

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    
    // ... existing meetup creation code ...

    // Update rate limits after successful creation
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    await prisma.rateLimit.upsert({
      where: {
        identifier_type_month_year: {
          identifier: req.body.email,
          type: 'email',
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        identifier: req.body.email,
        type: 'email',
        month: currentMonth,
        year: currentYear,
        count: 1,
      },
    });

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

    // ... rest of your response code ...
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 