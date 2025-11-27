import express from 'express';
import departmentRoutes from './departmentRoutes.js';
import designationRoutes from './designationRoutes.js';
import cityRoutes from './cityRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

// API routes
router.use('/api/auth', authRoutes);
router.use('/api', departmentRoutes);
router.use('/api', designationRoutes);
router.use('/api', cityRoutes);

export default router;