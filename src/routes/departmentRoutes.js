import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
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

const router = express.Router();

// Department routes
router.get('/departments', getAllDepartments);
router.get('/departments/:id', getDepartmentById);
router.post('/departments', authenticate, createDepartment);
router.post('/departments/bulk', authenticate, createDepartmentsBulk);
router.put('/departments/bulk', authenticate, updateDepartmentsBulk);
router.put('/departments/:id', authenticate, updateDepartment);
router.delete('/departments/bulk', authenticate, deleteDepartmentsBulk);
router.delete('/departments/:id', authenticate, deleteDepartment);

// Sub-department routes
router.get('/sub-departments', getAllSubDepartments);
router.get('/sub-departments/department/:departmentId', getSubDepartmentsByDepartment);
router.post('/sub-departments', authenticate, createSubDepartment);
router.post('/sub-departments/bulk', authenticate, createSubDepartmentsBulk);
router.put('/sub-departments/bulk', authenticate, updateSubDepartmentsBulk);
router.put('/sub-departments/:id', authenticate, updateSubDepartment);
router.delete('/sub-departments/bulk', authenticate, deleteSubDepartmentsBulk);
router.delete('/sub-departments/:id', authenticate, deleteSubDepartment);

export default router;

