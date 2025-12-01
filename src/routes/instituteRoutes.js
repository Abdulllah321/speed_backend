import express from 'express';
import {
  getAllInstitutes,
  getInstituteById,
  createInstitute,
  createInstitutesBulk,
  updateInstitute,
  deleteInstitute,
  seedInstitutesAPI,
} from '../controllers/instituteController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET routes (no auth required for reading)
router.get('/', getAllInstitutes);
router.get('/:id', getInstituteById);

// POST routes (auth required)
router.post('/', authenticate, createInstitute);
router.post('/bulk', authenticate, createInstitutesBulk);
router.post('/seed', authenticate, seedInstitutesAPI);

// PUT routes (auth required)
router.put('/:id', authenticate, updateInstitute);

// DELETE routes (auth required)
router.delete('/:id', authenticate, deleteInstitute);

export default router;

