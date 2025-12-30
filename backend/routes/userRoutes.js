import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { getAllUsers, getDoctors, adminCreateUser } from "../controllers/userController.js";

const router = express.Router();

// admin: list all users
router.get("/", protect, allowRoles("admin"), getAllUsers);

// patient/admin: list doctors
router.get("/doctors", protect, getDoctors);

// admin: create doctor/patient
router.post("/", protect, allowRoles("admin"), adminCreateUser);

export default router;
