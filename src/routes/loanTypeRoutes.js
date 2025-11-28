import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllLoanTypes,
  getLoanTypeById,
  createLoanType,
  createLoanTypesBulk,
  updateLoanType,
  updateLoanTypesBulk,
  deleteLoanType,
  deleteLoanTypesBulk,
} from '@/controllers/loanTypeController.js';

const router = express.Router();

router.use(authenticate);

router.get('/loan-types', getAllLoanTypes);
router.get('/loan-types/:id', getLoanTypeById);
router.post('/loan-types', createLoanType);
router.post('/loan-types/bulk', createLoanTypesBulk);
router.put('/loan-types/bulk', updateLoanTypesBulk);
router.put('/loan-types/:id', updateLoanType);
router.delete('/loan-types/bulk', deleteLoanTypesBulk);
router.delete('/loan-types/:id', deleteLoanType);

export default router;

