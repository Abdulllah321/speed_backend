import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import { strictLimiter, apiLimiter } from '@/middleware/rateLimiter.js';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployeesCsv,
} from '@/controllers/employeeController.js';

const router = express.Router();

router.use(authenticate);

router.get('/employees', apiLimiter, getAllEmployees);
router.get('/employees/:id', getEmployeeById);
router.post('/employees', strictLimiter, createEmployee);
router.put('/employees/:id', apiLimiter, updateEmployee);
router.delete('/employees/:id', strictLimiter, deleteEmployee);
router.post('/employees/import-csv', apiLimiter, ...importEmployeesCsv);

export default router;


