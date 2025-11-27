import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  createDepartmentsBulk,
  updateDepartment,
  updateDepartmentsBulk,
  deleteDepartment,
  deleteDepartmentsBulk,
  getAllSubDepartments,
  getSubDepartmentsByDepartment,
  createSubDepartment,
  createSubDepartmentsBulk,
  updateSubDepartment,
  updateSubDepartmentsBulk,
  deleteSubDepartment,
  deleteSubDepartmentsBulk,
} from '@/controllers/departmentController.js';
import { authenticate } from '@/middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Department routes
router.get('/departments', getAllDepartments);
router.get('/departments/:id', getDepartmentById);
router.post('/departments', createDepartment);
router.post('/departments/bulk', createDepartmentsBulk);
router.put('/departments/bulk', updateDepartmentsBulk);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/bulk', deleteDepartmentsBulk);
router.delete('/departments/:id', deleteDepartment);

// Sub-department routes
router.get('/sub-departments', getAllSubDepartments);
router.get('/sub-departments/department/:departmentId', getSubDepartmentsByDepartment);
router.post('/sub-departments', createSubDepartment);
router.post('/sub-departments/bulk', createSubDepartmentsBulk);
router.put('/sub-departments/bulk', updateSubDepartmentsBulk);
router.put('/sub-departments/:id', updateSubDepartment);
router.delete('/sub-departments/bulk', deleteSubDepartmentsBulk);
router.delete('/sub-departments/:id', deleteSubDepartment);

export default router;

