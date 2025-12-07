import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import { uploadSingle, uploadMultiple, listUploads, getUpload, downloadUpload, deleteUpload } from '@/controllers/uploadController.js';

const router = express.Router();

router.use(authenticate);

router.post('/uploads', ...uploadSingle);
router.post('/uploads/multiple', ...uploadMultiple);
router.get('/uploads', listUploads);
router.get('/uploads/:id', getUpload);
router.get('/uploads/:id/download', downloadUpload);
router.delete('/uploads/:id', deleteUpload);

export default router;
