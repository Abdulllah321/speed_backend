import express from "express";
import { authenticate } from "@/middleware/authMiddleware.js";
import { apiLimiter, strictLimiter } from "@/middleware/rateLimiter.js";
import {
  getAllExitClearances,
  getExitClearanceById,
  createExitClearance,
  updateExitClearance,
  deleteExitClearance,
  getEmployeeDepartmentInfo,
  getAllEmployeesForClearance,
} from "@/controllers/exitClearanceController.js";

const router = express.Router();

router.use(authenticate);

// Exit Clearance CRUD routes
router.get("/exit-clearances", apiLimiter, getAllExitClearances);
router.get("/exit-clearances/:id", getExitClearanceById);
router.post("/exit-clearances", strictLimiter, createExitClearance);
router.put("/exit-clearances/:id", apiLimiter, updateExitClearance);
router.delete("/exit-clearances/:id", strictLimiter, deleteExitClearance);

// Employee info routes
router.get("/employees-list", apiLimiter, getAllEmployeesForClearance);
router.get("/employee-department/:employeeId", getEmployeeDepartmentInfo);

export default router;
