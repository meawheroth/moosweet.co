require("dotenv").config();
const connectDB = require("./config/db");
const Customer = require("./models/Customer");

(async () => {
  await connectDB();
  const username = process.env.ADMIN_USERNAME || "admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("กรุณาตั้ง ADMIN_EMAIL และ ADMIN_PASSWORD ใน .env ก่อน");
    process.exit(1);
  }
  const existing = await Customer.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    existing.role = "admin";
    existing.username = username;
    existing.email = email;
    existing.password = password;
    await existing.save();
    console.log(`อัปเกรดผู้ใช้ ${email} เป็น admin แล้ว`);
  } else {
    await Customer.create({ username, email, password, role: "admin" });
    console.log(`สร้าง admin ${email} สำเร็จ`);
  }
  process.exit(0);
})();
