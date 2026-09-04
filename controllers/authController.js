const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

// สร้าง JWT token จาก customer id
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ตั้งค่า cookie ที่เก็บ token ให้ปลอดภัย (httpOnly ป้องกัน JS ฝั่ง client อ่านค่าได้)
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
  });
};

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "กรุณากรอก username, email และ password ให้ครบ" });
    }

    const existing = await Customer.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res
        .status(409)
        .json({ message: "email หรือ username นี้ถูกใช้งานแล้ว" });
    }

    const customer = await Customer.create({
      username,
      email,
      password,
      phone,
      address,
    });

    const token = generateToken(customer._id);
    setTokenCookie(res, token);

    res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ",
      customer: {
        id: customer._id,
        username: customer.username,
        email: customer.email,
        role: customer.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "กรุณากรอก email และ password" });
    }

    // ต้องระบุ .select("+password") เพราะ schema ตั้ง select:false ไว้
    const customer = await Customer.findOne({ email }).select("+password");

    if (!customer || !(await customer.comparePassword(password))) {
      return res.status(401).json({ message: "email หรือ password ไม่ถูกต้อง" });
    }

    const token = generateToken(customer._id);
    setTokenCookie(res, token);

    res.status(200).json({
      message: "login สำเร็จ",
      customer: {
        id: customer._id,
        username: customer.username,
        email: customer.email,
        role: customer.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

// @route POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "logout สำเร็จ" });
};

// @route GET /api/auth/me  (ต้อง login ก่อน - ใช้ทดสอบ middleware protect)
const getMe = async (req, res) => {
  res.status(200).json({ customer: req.customer });
};

module.exports = { register, login, logout, getMe };
