import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate, authorize, hasPermission } from '../middleware/authMiddleware.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes
router.post('/login', loginLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Session check (lightweight endpoint for polling)
router.get('/check-session', authenticate, authController.checkSession);

// Protected routes
router.use(authenticate);

router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAllDevices);
router.get('/me', authController.getMe);
router.post('/change-password', authController.changePassword);

// Session management
router.get('/sessions', authController.getActiveSessions);
router.delete('/sessions/:sessionId', authController.terminateSession);
router.get('/login-history', authController.getLoginHistory);

// Admin routes - Users
router.get('/users', hasPermission('users.view'), authController.getAllUsers);
router.put('/users/:id', hasPermission('users.update'), authController.updateUser);

// Admin routes - Roles & Permissions
router.get('/roles', hasPermission('roles.view'), authController.getRoles);
router.post('/roles', hasPermission('roles.create'), authController.createRole);
router.put('/roles/:id', hasPermission('roles.update'), authController.updateRole);
router.delete('/roles/:id', hasPermission('roles.delete'), authController.deleteRole);
router.get('/permissions', hasPermission('roles.view'), authController.getPermissions);

// Admin routes - Activity Logs
router.get('/activity-logs', hasPermission('activity_logs.view'), authController.getAllActivityLogs);

export default router;
