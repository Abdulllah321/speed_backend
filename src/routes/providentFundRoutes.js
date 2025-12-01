import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllProvidentFunds,
  getProvidentFundById,
  createProvidentFund,
  createProvidentFundsBulk,
  updateProvidentFund,
  updateProvidentFundsBulk,
  deleteProvidentFund,
  deleteProvidentFundsBulk,
} from '@/controllers/providentFundController.js';

const router = express.Router();

router.use(authenticate);

router.get('/provident-funds', getAllProvidentFunds);
router.get('/provident-funds/:id', getProvidentFundById);
router.post('/provident-funds', createProvidentFund);
router.post('/provident-funds/bulk', createProvidentFundsBulk);
router.put('/provident-funds/bulk', updateProvidentFundsBulk);
router.put('/provident-funds/:id', updateProvidentFund);
router.delete('/provident-funds/bulk', deleteProvidentFundsBulk);
router.delete('/provident-funds/:id', deleteProvidentFund);

export default router;

