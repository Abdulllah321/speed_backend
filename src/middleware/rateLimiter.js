import rateLimit from 'express-rate-limit';
import authConfig from '../config/auth.config.js';

// Login rate limiter
export const loginLimiter = rateLimit({
  windowMs: authConfig.rateLimit.login.windowMs,
  max: authConfig.rateLimit.login.max,
  message: {
    status: false,
    message: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: authConfig.rateLimit.api.windowMs,
  max: authConfig.rateLimit.api.max,
  message: {
    status: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for sensitive operations
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow more attempts during development
  message: {
    status: false,
    message: 'Too many attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
