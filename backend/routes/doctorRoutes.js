import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { getAllDoctors } from "../controllers/doctorController.js";

const router = express.Router();

// Admin - get doctors list
router.get("/", protect, allowRoles("admin"), getAllDoctors);

export default router;
