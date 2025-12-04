import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.config.js';
import prisma from '../models/database.js';
import { refreshTokensHelper } from '../controllers/authController.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token (fast operation - no database query)
      const decoded = jwt.verify(token, authConfig.jwt.accessSecret, { issuer: authConfig.jwt.issuer });

      // Attach user info to request immediately (don't wait for DB queries)
      req.user = decoded;

      // Update session last activity asynchronously (non-blocking)
      // This runs in the background and doesn't block the request
      prisma.session.updateMany({
        where: { token, userId: decoded.userId, isActive: true },
        data: { lastActivityAt: new Date() },
      }).catch(err => {
        // Silently fail - session update is not critical for request processing
        console.error('Session update failed (non-critical):', err);
      });

      // Continue immediately without waiting for DB queries
      next();
    } catch (verifyError) {
      // If token is expired, try to refresh using refresh token
      if (verifyError.name === 'TokenExpiredError') {
        // Try to get refresh token from cookies or header
        const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
        
        if (refreshToken) {
          // Attempt to refresh tokens
          const refreshResult = await refreshTokensHelper(refreshToken);
          
          if (refreshResult.success) {
            // Attach new access token info to request
            req.user = refreshResult.user;
            
            // Set new tokens in response headers (client can read these)
            res.setHeader('X-New-Access-Token', refreshResult.accessToken);
            res.setHeader('X-New-Refresh-Token', refreshResult.refreshToken);
            
            // Also set cookies if cookies were used
            if (req.cookies?.refreshToken) {
              res.cookie('accessToken', refreshResult.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 2 * 60 * 60, // 2 hours
                path: '/',
              });
              res.cookie('refreshToken', refreshResult.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60, // 30 days
                path: '/',
              });
            }

            // Update session with new access token
            prisma.session.updateMany({
              where: { userId: refreshResult.user.userId, isActive: true },
              data: { 
                token: refreshResult.accessToken,
                lastActivityAt: new Date() 
              },
            }).catch(err => {
              console.error('Session update failed (non-critical):', err);
            });

            // Continue with the request using new access token
            next();
            return;
          }
        }
        
        // If refresh failed or no refresh token, return expired error
        return res.status(401).json({ status: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      
      // For other JWT errors, throw to be caught by outer catch
      throw verifyError;
    }
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
