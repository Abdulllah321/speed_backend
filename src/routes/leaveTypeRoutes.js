import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  createLeaveTypesBulk,
  updateLeaveType,
  updateLeaveTypesBulk,
  deleteLeaveType,
  deleteLeaveTypesBulk,
} from '@/controllers/leaveTypeController.js';

const router = express.Router();

router.use(authenticate);

router.get('/leave-types', getAllLeaveTypes);
router.get('/leave-types/:id', getLeaveTypeById);
router.post('/leave-types', createLeaveType);
router.post('/leave-types/bulk', createLeaveTypesBulk);
router.put('/leave-types/bulk', updateLeaveTypesBulk);
router.put('/leave-types/:id', updateLeaveType);
router.delete('/leave-types/bulk', deleteLeaveTypesBulk);
router.delete('/leave-types/:id', deleteLeaveType);

export default router;

