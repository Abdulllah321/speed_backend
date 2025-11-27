import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllJobTypes,
  getJobTypeById,
  createJobType,
  createJobTypesBulk,
  updateJobType,
  updateJobTypesBulk,
  deleteJobType,
  deleteJobTypesBulk,
} from '@/controllers/jobTypeController.js';

const router = express.Router();

router.use(authenticate);

router.get('/job-types', getAllJobTypes);
router.get('/job-types/:id', getJobTypeById);
router.post('/job-types', createJobType);
router.post('/job-types/bulk', createJobTypesBulk);
router.put('/job-types/bulk', updateJobTypesBulk);
router.put('/job-types/:id', updateJobType);
router.delete('/job-types/bulk', deleteJobTypesBulk);
router.delete('/job-types/:id', deleteJobType);

export default router;

