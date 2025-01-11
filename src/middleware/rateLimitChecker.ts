import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../lib/prisma';

const MONTHLY_LIMIT = 3;

export async function checkRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
  const email = req.body?.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  try {
    // Check email limit
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
      return res.status(429).json({
        error: 'Monthly limit exceeded for this email address'
      });
    }

    // Check IP limit
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
      return res.status(429).json({
        error: 'Monthly limit exceeded for this IP address'
      });
    }

    return next();
  } catch (error) {
    console.error('Rate limit check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 