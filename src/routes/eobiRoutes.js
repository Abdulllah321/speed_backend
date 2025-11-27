import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllEOBIs,
  getEOBIById,
  createEOBI,
  createEOBIsBulk,
  updateEOBI,
  updateEOBIsBulk,
  deleteEOBI,
  deleteEOBIsBulk,
} from '@/controllers/eobiController.js';

const router = express.Router();

router.use(authenticate);

router.get('/eobis', getAllEOBIs);
router.get('/eobis/:id', getEOBIById);
router.post('/eobis', createEOBI);
router.post('/eobis/bulk', createEOBIsBulk);
router.put('/eobis/bulk', updateEOBIsBulk);
router.put('/eobis/:id', updateEOBI);
router.delete('/eobis/bulk', deleteEOBIsBulk);
router.delete('/eobis/:id', deleteEOBI);

export default router;

