import prisma from '../models/database.js';
import authConfig from '../config/auth.config.js';

class SecurityService {
  async checkAndHandleFailedLogin(user, ipAddress, userAgent) {
    const attempts = user.failedLoginAttempts + 1;

    if (attempts >= authConfig.security.maxFailedAttempts) {
      const lockedUntil = new Date(Date.now() + authConfig.security.lockoutDuration);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts, lockedUntil, status: 'suspended' },
      });

      return { locked: true, lockedUntil };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: attempts },
    });

    return { locked: false, attempts };
  }

  async resetFailedAttempts(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null, status: 'active' },
    });
  }

  async isAccountLocked(user) {
    if (user.status === 'suspended' && user.lockedUntil) {
      if (new Date() < new Date(user.lockedUntil)) {
        return { locked: true, lockedUntil: user.lockedUntil };
      }
      await this.resetFailedAttempts(user.id);
    }
    return { locked: false };
  }

  async terminateAllSessions(userId, exceptSessionId = null) {
    const where = { userId, isActive: true };
    if (exceptSessionId) where.id = { not: exceptSessionId };

    return prisma.session.updateMany({ where, data: { isActive: false } });
  }

  async revokeAllRefreshTokens(userId, exceptFamily = null) {
    const where = { userId, isRevoked: false };
    if (exceptFamily) where.family = { not: exceptFamily };

    return prisma.refreshToken.updateMany({ where, data: { isRevoked: true } });
  }
}

export default new SecurityService();
