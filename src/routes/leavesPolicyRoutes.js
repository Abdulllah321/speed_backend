import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllLeavesPolicies,
  getLeavesPolicyById,
  createLeavesPolicy,
  createLeavesPoliciesBulk,
  updateLeavesPolicy,
  updateLeavesPoliciesBulk,
  deleteLeavesPolicy,
  deleteLeavesPoliciesBulk,
} from '@/controllers/leavesPolicyController.js';

const router = express.Router();

// GET routes (no auth required for reading)
router.get('/leaves-policies', getAllLeavesPolicies);
router.get('/leaves-policies/:id', getLeavesPolicyById);

// Write routes (auth required)
router.post('/leaves-policies', authenticate, createLeavesPolicy);
router.post('/leaves-policies/bulk', authenticate, createLeavesPoliciesBulk);
router.put('/leaves-policies/bulk', authenticate, updateLeavesPoliciesBulk);
router.put('/leaves-policies/:id', authenticate, updateLeavesPolicy);
router.delete('/leaves-policies/bulk', authenticate, deleteLeavesPoliciesBulk);
router.delete('/leaves-policies/:id', authenticate, deleteLeavesPolicy);

export default router;

