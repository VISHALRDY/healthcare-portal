import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import "dotenv/config";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteMany({}); // optional: wipe

  const password = await bcrypt.hash("123456", 10);

  await User.create([
    { name: "Admin One", email: "admin@test.com", password, role: "admin" },
    { name: "Dr John", email: "doctor1@test.com", password, role: "doctor" },
    { name: "Dr Mary", email: "doctor2@test.com", password, role: "doctor" },
    { name: "Patient One", email: "patient@test.com", password, role: "patient" },
  ]);

  console.log("✅ Seeded users");
  process.exit();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
