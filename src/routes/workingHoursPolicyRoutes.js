import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllWorkingHoursPolicies,
  getWorkingHoursPolicyById,
  createWorkingHoursPolicy,
  updateWorkingHoursPolicy,
  deleteWorkingHoursPolicy,
} from '@/controllers/workingHoursPolicyController.js';

const router = express.Router();

router.use(authenticate);

router.get('/working-hours-policies', getAllWorkingHoursPolicies);
router.get('/working-hours-policies/:id', getWorkingHoursPolicyById);
router.post('/working-hours-policies', createWorkingHoursPolicy);
router.put('/working-hours-policies/:id', updateWorkingHoursPolicy);
router.delete('/working-hours-policies/:id', deleteWorkingHoursPolicy);

export default router;

