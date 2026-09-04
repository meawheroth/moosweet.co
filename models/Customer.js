const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ประวัติการซื้อ 1 รายการ (สามารถขยาย field เพิ่มได้ตามต้องการ)
const purchaseHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    productName: String,
    quantity: { type: Number, default: 1 },
    price: Number,
    purchasedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "กรุณากรอก username"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "กรุณากรอก email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "รูปแบบ email ไม่ถูกต้อง"],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    password: {
      type: String,
      required: [true, "กรุณากรอก password"],
      minlength: 6,
      select: false, // ไม่ดึง password ออกมาโดย default ทุกครั้งที่ query
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      district: String,
      province: String,
      postalCode: String,
      country: { type: String, default: "Thailand" },
    },
    purchaseHistory: [purchaseHistorySchema],
  },
  { timestamps: true }
);

// เข้ารหัส password ก่อนบันทึก ถ้ามีการแก้ไข field password
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// method เปรียบเทียบ password ตอน login
customerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Customer", customerSchema);
