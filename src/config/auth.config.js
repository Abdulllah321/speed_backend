export default {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    accessExpiresIn: '15m', // Short-lived access token
    refreshExpiresIn: '1d', // 1 day session via refresh token
    issuer: 'speed-limit-app',
  },
  password: {
    minLength: 8,
    saltRounds: 12,
  },
  security: {
    maxFailedAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },
  rateLimit: {
    login: { windowMs: 15 * 60 * 1000, max: 5 },
    register: { windowMs: 60 * 60 * 1000, max: 10 },
    api: { windowMs: 60 * 1000, max: 100 },
    passwordReset: { windowMs: 60 * 60 * 1000, max: 3 },
  },
};
