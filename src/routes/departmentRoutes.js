import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllSubDepartments,
  getSubDepartmentsByDepartment,
  createSubDepartment,
  updateSubDepartment,
  deleteSubDepartment,
} from '@/controllers/departmentController.js';

const router = express.Router();

// Department routes
router.get('/departments', getAllDepartments);
router.get('/departments/:id', getDepartmentById);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Sub-department routes
router.get('/sub-departments', getAllSubDepartments);
router.get('/sub-departments/department/:departmentId', getSubDepartmentsByDepartment);
router.post('/sub-departments', createSubDepartment);
router.put('/sub-departments/:id', updateSubDepartment);
router.delete('/sub-departments/:id', deleteSubDepartment);

export default router;

