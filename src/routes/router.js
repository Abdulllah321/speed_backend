import express from 'express';
import departmentRoutes from './departmentRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

// API routes
router.use('/api/auth', authRoutes);
router.use('/api', departmentRoutes);

export default router;