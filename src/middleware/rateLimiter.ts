import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true, // Enable RateLimit headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
  legacyHeaders: false,
  // Custom handler for when limit is exceeded
  handler: (req, res) => {
    const retryAfterSec = Math.ceil(config.rateLimit.windowMs / 1000);
    res.set('Retry-After', retryAfterSec.toString());
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
    });
  },
});
