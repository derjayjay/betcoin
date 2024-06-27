import { Request } from 'express';
import { rateLimit } from 'express-rate-limit';

import config from '../utils/config';

export const commonRateLimiter = rateLimit({
  legacyHeaders: true,
  limit: config.RATE_LIMITING_COMMON_MAX_REQUESTS,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  windowMs: config.RATE_LIMITING_COMMON_WINDOW_MIN * 60 * 1000,
  keyGenerator: (req: Request) => req.ip as string,
});

export const userRouterRateLimiter = rateLimit({
  legacyHeaders: true,
  limit: config.RATE_LIMITING_USER_MAX_FAILED_REQUESTS,
  skipSuccessfulRequests: true,
  message: 'Too many failed requests.',
  standardHeaders: true,
  windowMs: config.RATE_LIMITING_USER_WINDOW_MIN * 60 * 1000,
  keyGenerator: (req: Request) => req.ip as string,
});
