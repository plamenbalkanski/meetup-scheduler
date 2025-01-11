import { prisma } from '../lib/prisma';

export async function cleanupOldRateLimits() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  await prisma.rateLimit.deleteMany({
    where: {
      OR: [
        { year: { lt: threeMonthsAgo.getFullYear() } },
        {
          AND: [
            { year: threeMonthsAgo.getFullYear() },
            { month: { lt: threeMonthsAgo.getMonth() + 1 } }
          ]
        }
      ]
    }
  });
} 