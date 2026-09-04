const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const { items, note, phone, shippingAddress, paymentMethod = "cod" } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ" });
    if (!shippingAddress) return res.status(400).json({ message: "กรุณากรอกที่อยู่จัดส่ง" });
    if (!["cod", "bank_transfer"].includes(paymentMethod)) return res.status(400).json({ message: "วิธีชำระเงินไม่ถูกต้อง" });

    const ids = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: ids } });
    const map = new Map(products.map(p => [String(p._id), p]));
    const orderItems = [];

    for (const item of items) {
      const p = map.get(String(item.productId));
      const qty = Math.max(1, Number(item.quantity) || 1);
      if (!p) return res.status(404).json({ message: "ไม่พบสินค้าบางรายการ" });
      if (p.quantity < qty) return res.status(400).json({ message: `สินค้า ${p.name} มีไม่พอ` });
      orderItems.push({ product: p._id, productName: p.name, quantity: qty, price: p.price });
    }

    // ตัดสต็อกแบบตรวจสอบเงื่อนไขทุกชิ้น ป้องกันยอดติดลบจากการสั่งพร้อมกัน
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
      if (!updated) return res.status(409).json({ message: `สินค้า ${item.productName} มีไม่พอแล้ว กรุณาตรวจสอบตะกร้าอีกครั้ง` });
    }

    const total = orderItems.reduce((sum, x) => sum + x.price * x.quantity, 0);
    const customer = await Customer.findById(req.customer._id);
    const order = await Order.create({
      customer: customer._id,
      customerName: customer.username,
      customerEmail: customer.email,
      phone: phone || customer.phone,
      shippingAddress,
      paymentMethod,
      items: orderItems,
      total,
      note
    });

    customer.phone = phone || customer.phone;
    customer.address = { ...(customer.address || {}), street: shippingAddress };
    customer.purchaseHistory.push(...orderItems.map(x => ({ product:x.product, productName:x.productName, quantity:x.quantity, price:x.price })));
    await customer.save();

    res.status(201).json({ message: "สั่งซื้อสำเร็จ", order });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

const getHistory = async (req, res) => res.json(await Order.find({ customer: req.customer._id }).sort({ createdAt: -1 }));
const getAllOrders = async (req, res) => res.json(await Order.find().populate("customer", "username email phone").sort({ createdAt: -1 }));

const updateOrderStatus = async (req, res) => {
  const allowed = ["pending","confirmed","preparing","shipping","completed","cancelled"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: "ไม่พบออเดอร์" });
  res.json({ message: "อัปเดตสถานะสำเร็จ", order });
};

module.exports = { createOrder, getHistory, getAllOrders, updateOrderStatus };
