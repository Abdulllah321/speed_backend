import express from 'express';
import {
  getAllQualifications,
  getQualificationById,
  createQualification,
  createQualificationsBulk,
  updateQualification,
  deleteQualification,
} from '../controllers/qualificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET routes (no auth required for reading)
router.get('/', getAllQualifications);
router.get('/:id', getQualificationById);

// POST routes (auth required)
router.post('/', authenticate, createQualification);
router.post('/bulk', authenticate, createQualificationsBulk);

// PUT routes (auth required)
router.put('/:id', authenticate, updateQualification);

// DELETE routes (auth required)
router.delete('/:id', authenticate, deleteQualification);

export default router;

