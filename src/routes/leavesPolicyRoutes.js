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

router.use(authenticate);

router.get('/leaves-policies', getAllLeavesPolicies);
router.get('/leaves-policies/:id', getLeavesPolicyById);
router.post('/leaves-policies', createLeavesPolicy);
router.post('/leaves-policies/bulk', createLeavesPoliciesBulk);
router.put('/leaves-policies/bulk', updateLeavesPoliciesBulk);
router.put('/leaves-policies/:id', updateLeavesPolicy);
router.delete('/leaves-policies/bulk', deleteLeavesPoliciesBulk);
router.delete('/leaves-policies/:id', deleteLeavesPolicy);

export default router;

