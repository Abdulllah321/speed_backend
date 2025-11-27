import express from 'express';
import departmentRoutes from './departmentRoutes.js';

const router = express.Router();

// API routes
router.use('/api', departmentRoutes);

export default router;