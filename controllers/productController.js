const Product = require("../models/Product");

// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "ไม่พบสินค้านี้" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

// @route POST /api/products  (ต้อง login ก่อน)
const createProduct = async (req, res) => {
  try {
    const { name, description, quantity, price, category, imageUrl } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "กรุณากรอกชื่อสินค้าและราคา" });
    }

    const product = await Product.create({
      name,
      description,
      quantity,
      price,
      category,
      imageUrl,
    });

    res.status(201).json({ message: "เพิ่มสินค้าสำเร็จ", product });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

// @route PUT /api/products/:id  (ต้อง login ก่อน)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "ไม่พบสินค้านี้" });
    }

    res.status(200).json({ message: "แก้ไขสินค้าสำเร็จ", product });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

// @route DELETE /api/products/:id  (ต้อง login ก่อน)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "ไม่พบสินค้านี้" });
    }
    res.status(200).json({ message: "ลบสินค้าสำเร็จ" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
