const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");

// ดูสินค้า: เปิดให้ทุกคนดูได้ ไม่ต้อง login
router.get("/", getProducts);
router.get("/:id", getProductById);

// เพิ่ม/แก้ไข/ลบ สินค้า: ต้อง login ก่อน (เช่น เฉพาะแอดมิน)
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
