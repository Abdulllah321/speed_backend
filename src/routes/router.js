import express from 'express';
import departmentRoutes from './departmentRoutes.js';
import designationRoutes from './designationRoutes.js';
import cityRoutes from './cityRoutes.js';
import branchRoutes from './branchRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

// API routes
router.use('/api/auth', authRoutes);
router.use('/api', departmentRoutes);
router.use('/api', designationRoutes);
router.use('/api', cityRoutes);
router.use('/api', branchRoutes);

export default router;