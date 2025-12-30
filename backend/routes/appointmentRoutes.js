import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import {
  createAppointment,
  myAppointments,
  doctorAppointments,
  updateAppointmentStatus,
  getAllAppointments,
} from "../controllers/appointmentController.js";

const router = express.Router();

// Patient
router.post("/", protect, allowRoles("patient"), createAppointment);
router.get("/my", protect, allowRoles("patient"), myAppointments);

// Doctor
router.get("/doctor", protect, allowRoles("doctor"), doctorAppointments);
router.put("/:id/status", protect, allowRoles("doctor"), updateAppointmentStatus);

// Admin
router.get("/", protect, allowRoles("admin"), getAllAppointments);

export default router;
