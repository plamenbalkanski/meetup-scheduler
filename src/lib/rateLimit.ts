import { RateLimiterMemory } from 'rate-limiter-flexible'

// Hourly rate limiter
const hourlyLimiter = new RateLimiterMemory({
  points: 9, // 9 emails allowed per hour
  duration: 3600, // 1 hour in seconds
})

// Daily rate limiter
const dailyLimiter = new RateLimiterMemory({
  points: 20, // 20 emails allowed per day
  duration: 86400, // 24 hours in seconds
})

// Combined rate limiter function
export async function checkRateLimit(email: string) {
  try {
    // Check both limits
    await Promise.all([
      hourlyLimiter.consume(email),
      dailyLimiter.consume(email)
    ])
    return { success: true }
  } catch (error) {
    const isHourlyLimit = error.msBeforeNext < 3600000 // 1 hour in milliseconds
    return {
      success: false,
      error: isHourlyLimit
        ? 'Hourly email limit reached. Please try again later.'
        : 'Daily email limit reached. Please try again tomorrow.'
    }
  }
} 