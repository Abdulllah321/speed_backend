import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllTaxSlabs,
  getTaxSlabById,
  createTaxSlab,
  createTaxSlabsBulk,
  updateTaxSlab,
  updateTaxSlabsBulk,
  deleteTaxSlab,
  deleteTaxSlabsBulk,
} from '@/controllers/taxSlabController.js';

const router = express.Router();

router.use(authenticate);

router.get('/tax-slabs', getAllTaxSlabs);
router.get('/tax-slabs/:id', getTaxSlabById);
router.post('/tax-slabs', createTaxSlab);
router.post('/tax-slabs/bulk', createTaxSlabsBulk);
router.put('/tax-slabs/bulk', updateTaxSlabsBulk);
router.put('/tax-slabs/:id', updateTaxSlab);
router.delete('/tax-slabs/bulk', deleteTaxSlabsBulk);
router.delete('/tax-slabs/:id', deleteTaxSlab);

export default router;

