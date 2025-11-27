import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllMaritalStatuses,
  getMaritalStatusById,
  createMaritalStatus,
  createMaritalStatusesBulk,
  updateMaritalStatus,
  updateMaritalStatusesBulk,
  deleteMaritalStatus,
  deleteMaritalStatusesBulk,
} from '@/controllers/maritalStatusController.js';

const router = express.Router();

router.use(authenticate);

router.get('/marital-statuses', getAllMaritalStatuses);
router.get('/marital-statuses/:id', getMaritalStatusById);
router.post('/marital-statuses', createMaritalStatus);
router.post('/marital-statuses/bulk', createMaritalStatusesBulk);
router.put('/marital-statuses/bulk', updateMaritalStatusesBulk);
router.put('/marital-statuses/:id', updateMaritalStatus);
router.delete('/marital-statuses/bulk', deleteMaritalStatusesBulk);
router.delete('/marital-statuses/:id', deleteMaritalStatus);

export default router;

