import express from "express";
import { authenticate } from "@/middleware/authMiddleware.js";
import {
  getAllDesignations,
  getDesignationById,
  createDesignation,
  createDesignationsBulk,
  updateDesignation,
  updateDesignationsBulk,
  deleteDesignation,
  deleteDesignationsBulk,
} from "@/controllers/designationController.js";

const router = express.Router();

// Designation routes
router.get("/designations", getAllDesignations);
router.get("/designations/:id", getDesignationById);
router.post("/designations", authenticate, createDesignation);
router.post("/designations/bulk", authenticate, createDesignationsBulk);
router.put("/designations/bulk", authenticate, updateDesignationsBulk);
router.put("/designations/:id", authenticate, updateDesignation);
router.delete("/designations/bulk", authenticate, deleteDesignationsBulk);
router.delete("/designations/:id", authenticate, deleteDesignation);

export default router;
