import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible'

// Hourly rate limiter
const hourlyLimiter = new RateLimiterMemory({
  points: 9,
  duration: 3600,
  blockDuration: 3600, // Block for 1 hour when limit is reached
})

// Daily rate limiter
const dailyLimiter = new RateLimiterMemory({
  points: 20,
  duration: 86400,
  blockDuration: 86400, // Block for 24 hours when limit is reached
})

export async function checkRateLimit(email: string) {
  try {
    const [hourlyResult, dailyResult] = await Promise.all([
      hourlyLimiter.consume(email),
      dailyLimiter.consume(email)
    ])

    return { 
      success: true,
      remaining: {
        hourly: hourlyResult.remainingPoints,
        daily: dailyResult.remainingPoints
      }
    }
  } catch (error) {
    const rateLimitError = error as RateLimiterRes
    const isHourlyLimit = rateLimitError.msBeforeNext < 3600000

    const timeLeft = Math.ceil(rateLimitError.msBeforeNext / 1000 / 60) // minutes
    
    return {
      success: false,
      error: isHourlyLimit
        ? `Rate limit reached. Please try again in ${timeLeft} minutes.`
        : `Daily limit reached. Please try again tomorrow.`,
      remaining: {
        hourly: rateLimitError.remainingPoints,
        daily: rateLimitError.remainingPoints
      }
    }
  }
} 