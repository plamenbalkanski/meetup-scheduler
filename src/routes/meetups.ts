import { checkRateLimit } from '../middleware/rateLimitChecker';
import { prisma } from '../lib/prisma';

router.post('/', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
    
    // ... existing meetup creation code ...

    // After successful meetup creation, update rate limits
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Update email rate limit
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

    // Update IP rate limit
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

    // ... rest of the existing response code ...
  } catch (error) {
    // ... existing error handling ...
  }
}); 