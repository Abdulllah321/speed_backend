import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllEmployeeGrades,
  getEmployeeGradeById,
  createEmployeeGrade,
  createEmployeeGradesBulk,
  updateEmployeeGrade,
  updateEmployeeGradesBulk,
  deleteEmployeeGrade,
  deleteEmployeeGradesBulk,
} from '@/controllers/employeeGradeController.js';

const router = express.Router();

router.use(authenticate);

router.get('/employee-grades', getAllEmployeeGrades);
router.get('/employee-grades/:id', getEmployeeGradeById);
router.post('/employee-grades', createEmployeeGrade);
router.post('/employee-grades/bulk', createEmployeeGradesBulk);
router.put('/employee-grades/bulk', updateEmployeeGradesBulk);
router.put('/employee-grades/:id', updateEmployeeGrade);
router.delete('/employee-grades/bulk', deleteEmployeeGradesBulk);
router.delete('/employee-grades/:id', deleteEmployeeGrade);

export default router;

