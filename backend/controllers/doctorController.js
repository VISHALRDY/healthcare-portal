import User from "../models/User.js";

// GET /api/doctor  (admin only) -> list all doctors
export const getAllDoctors = async (req, res) => {
  const doctors = await User.find({ role: "doctor" })
    .select("-password")
    .sort({ createdAt: -1 });

  res.json(doctors);
};
