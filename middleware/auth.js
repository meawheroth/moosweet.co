const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return res.status(401).json({ message: "กรุณา login ก่อนใช้งาน" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id);
    if (!customer) return res.status(401).json({ message: "ไม่พบผู้ใช้งาน" });

    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.customer || req.customer.role !== "admin") {
    return res.status(403).json({ message: "คุณไม่มีสิทธิ์สำหรับส่วนผู้ดูแลระบบ" });
  }
  next();
};

module.exports = { protect, adminOnly };
