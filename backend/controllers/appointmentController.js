import Appointment from "../models/Appointment.js";

// PATIENT: create appointment (status pending by default)
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, appointmentDate, reason } = req.body;

    // accept both date or appointmentDate from frontend
    const dt = appointmentDate || date;

    if (!doctorId || !dt || !reason) {
      return res.status(400).json({ message: "doctorId, date, reason are required" });
    }

    const appt = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate: new Date(dt),
      reason,
      status: "pending",
      doctorNotes: "",
    });

    res.status(201).json(appt);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// PATIENT: my appointments (✅ includes doctorNotes)
export const myAppointments = async (req, res) => {
  try {
    const list = await Appointment.find({ patientId: req.user._id })
      .populate("doctorId", "name email")
      .sort({ appointmentDate: -1 });

    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// DOCTOR: appointments assigned to doctor
export const doctorAppointments = async (req, res) => {
  try {
    const list = await Appointment.find({ doctorId: req.user._id })
      .populate("patientId", "name email")
      .sort({ appointmentDate: -1 });

    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// DOCTOR: approve/reject + save notes (✅ saves doctorNotes)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"
    const { doctorNotes = "" } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    // allow only assigned doctor
    if (String(appt.doctorId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    appt.status = status;
    appt.doctorNotes = doctorNotes; // ✅ store notes
    await appt.save();

    const updated = await Appointment.findById(appt._id)
      .populate("patientId", "name email")
      .populate("doctorId", "name email");

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const list = await Appointment.find()
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .sort({ appointmentDate: -1 });

    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};
