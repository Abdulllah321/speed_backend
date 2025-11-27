import express from "express";
import departmentRoutes from "./departmentRoutes.js";
import designationRoutes from "./designationRoutes.js";
import jobTypeRoutes from "./jobTypeRoutes.js";
import maritalStatusRoutes from "./maritalStatusRoutes.js";
import taxSlabRoutes from "./taxSlabRoutes.js";
import eobiRoutes from "./eobiRoutes.js";
import authRoutes from "./authRoutes.js";
import cityRoutes from "./cityRoutes.js";
import branchRoutes from "./branchRoutes.js";
const router = express.Router();

// API routes
router.use("/api/auth", authRoutes);
router.use("/api", departmentRoutes);
router.use("/api", designationRoutes);
router.use("/api", jobTypeRoutes);
router.use("/api", maritalStatusRoutes);
router.use("/api", taxSlabRoutes);
router.use("/api", eobiRoutes);
router.use("/api", designationRoutes);
router.use("/api", cityRoutes);
router.use("/api", branchRoutes);
export default router;
