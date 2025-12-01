import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllEmployeeStatuses,
  getEmployeeStatusById,
  createEmployeeStatus,
  createEmployeeStatusesBulk,
  updateEmployeeStatus,
  updateEmployeeStatusesBulk,
  deleteEmployeeStatus,
  deleteEmployeeStatusesBulk,
} from '@/controllers/employeeStatusController.js';

const router = express.Router();

router.use(authenticate);

router.get('/employee-statuses', getAllEmployeeStatuses);
router.get('/employee-statuses/:id', getEmployeeStatusById);
router.post('/employee-statuses', createEmployeeStatus);
router.post('/employee-statuses/bulk', createEmployeeStatusesBulk);
router.put('/employee-statuses/bulk', updateEmployeeStatusesBulk);
router.put('/employee-statuses/:id', updateEmployeeStatus);
router.delete('/employee-statuses/bulk', deleteEmployeeStatusesBulk);
router.delete('/employee-statuses/:id', deleteEmployeeStatus);

export default router;

