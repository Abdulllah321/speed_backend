import { Router } from 'express';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  createBranchesBulk,
  updateBranch,
  updateBranchesBulk,
  deleteBranch,
  deleteBranchesBulk,
} from '@/controllers/branchController.js';
import { authenticate } from '@/middleware/authMiddleware.js';

const router = Router();

// Branch routes
router.get('/branches', getAllBranches);
router.get('/branches/:id', getBranchById);
router.post('/branches', authenticate, createBranch);
router.post('/branches/bulk', authenticate, createBranchesBulk);
router.put('/branches/bulk', authenticate, updateBranchesBulk);
router.put('/branches/:id', authenticate, updateBranch);
router.delete('/branches/bulk', authenticate, deleteBranchesBulk);
router.delete('/branches/:id', authenticate, deleteBranch);

export default router;

