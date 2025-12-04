import prisma from '../models/database.js';
import realtimeService from './realtimeService.js';

class ActivityLogService {
  async log({
    userId = null,
    action,
    module = null,
    entity = null,
    entityId = null,
    description = null,
    oldValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null,
    status = 'success',
    errorMessage = null,
    metadata = null,
  }) {
    try {
      const activityLog = await prisma.activityLog.create({
        data: {
          userId,
          action,
          module,
          entity,
          entityId: entityId?.toString(),
          description,
          oldValues: oldValues ? JSON.stringify(oldValues) : null,
          newValues: newValues ? JSON.stringify(newValues) : null,
          ipAddress,
          userAgent,
          status,
          errorMessage,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Emit realtime event
      realtimeService.emitActivityLog(activityLog);

      return activityLog;
    } catch (error) {
      console.error('Activity log error:', error);
      return null;
    }
  }

  async logLogin(userId, ipAddress, userAgent, status, failReason = null) {
    await this.log({
      userId,
      action: 'login',
      module: 'auth',
      description: status === 'success' ? 'User logged in' : 'Login failed',
      ipAddress,
      userAgent,
      status,
      errorMessage: failReason,
    });

    await prisma.loginHistory.create({
      data: { userId, ipAddress, userAgent, status, failReason },
    });
  }

  async logLogout(userId, ipAddress, userAgent) {
    await this.log({
      userId,
      action: 'logout',
      module: 'auth',
      description: 'User logged out',
      ipAddress,
      userAgent,
    });
  }

  async logPasswordChange(userId, ipAddress, userAgent) {
    await this.log({
      userId,
      action: 'password_change',
      module: 'auth',
      description: 'Password changed',
      ipAddress,
      userAgent,
    });
  }

  async getLoginHistory(userId, limit = 10) {
    return prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAllActivities(options = {}) {
    const { page = 1, limit = 50, userId = null, action = null, module = null, startDate = null, endDate = null } = options;

    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (module) where.module = module;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export default new ActivityLogService();
