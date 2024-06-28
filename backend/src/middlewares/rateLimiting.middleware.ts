import { Request } from 'express';
import { rateLimit } from 'express-rate-limit';

import config from '../utils/config';

/**
 * Middleware function for rate limiting common requests.
 *
 * @remarks
 * This middleware limits the number of requests that can be made within a specified time window.
 * If the limit is exceeded, the status code TOO_MANY_REQUESTS will be sent.
 */
export const commonRateLimiter = rateLimit({
  legacyHeaders: true,
  limit: config.RATE_LIMITING_COMMON_MAX_REQUESTS,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  windowMs: config.RATE_LIMITING_COMMON_WINDOW_MIN * 60 * 1000,
  keyGenerator: (req: Request) => req.ip as string,
});

/**
 * Middleware function for rate limiting of failed user route requests.
 * This is used to prevent brute force attacks on login, register, and refresh token routes.
 *
 * @remarks
 * This middleware limits the number of requests that can be made within a specified time window.
 * If the limit is exceeded, the status code TOO_MANY_REQUESTS will be sent.
 */
export const userRouterRateLimiter = rateLimit({
  legacyHeaders: true,
  limit: config.RATE_LIMITING_USER_MAX_FAILED_REQUESTS,
  skipSuccessfulRequests: true,
  message: 'Too many failed requests.',
  standardHeaders: true,
  windowMs: config.RATE_LIMITING_USER_WINDOW_MIN * 60 * 1000,
  keyGenerator: (req: Request) => req.ip as string,
});
