import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.config.js';
import prisma from '../models/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, authConfig.jwt.accessSecret, { issuer: authConfig.jwt.issuer });

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, status: true, passwordChangedAt: true, roleId: true },
    });

    if (!user) {
      return res.status(401).json({ status: false, message: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ status: false, message: 'Account is not active' });
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const tokenIssuedAt = new Date(decoded.iat * 1000);
      if (user.passwordChangedAt > tokenIssuedAt) {
        return res.status(401).json({ status: false, message: 'Password changed. Please login again.' });
      }
    }

    // Update session last activity
    await prisma.session.updateMany({
      where: { token, userId: decoded.userId, isActive: true },
      data: { lastActivityAt: new Date() },
    });

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: false, message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ status: false, message: 'Authentication failed' });
  }
};

export const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: false, message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true },
    });

    if (!user?.role || !roles.includes(user.role.name)) {
      return res.status(403).json({ status: false, message: 'Insufficient permissions' });
    }

    next();
  };
};

export const hasPermission = (...permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: false, message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    if (!user?.role) {
      return res.status(403).json({ status: false, message: 'No role assigned' });
    }

    const userPermissions = user.role.permissions.map(rp => rp.permission.name);
    const hasRequired = permissions.some(p => userPermissions.includes(p));

    if (!hasRequired) {
      return res.status(403).json({ status: false, message: 'Permission denied' });
    }

    next();
  };
};
