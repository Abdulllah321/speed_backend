import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllEquipments,
  getEquipmentById,
  createEquipment,
  createEquipmentsBulk,
  updateEquipment,
  updateEquipmentsBulk,
  deleteEquipment,
  deleteEquipmentsBulk,
} from '@/controllers/equipmentController.js';

const router = express.Router();

router.use(authenticate);

router.get('/equipments', getAllEquipments);
router.get('/equipments/:id', getEquipmentById);
router.post('/equipments', createEquipment);
router.post('/equipments/bulk', createEquipmentsBulk);
router.put('/equipments/bulk', updateEquipmentsBulk);
router.put('/equipments/:id', updateEquipment);
router.delete('/equipments/bulk', deleteEquipmentsBulk);
router.delete('/equipments/:id', deleteEquipment);

export default router;

