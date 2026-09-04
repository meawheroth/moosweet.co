const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  customerName: String,
  customerEmail: String,
  phone: String,
  shippingAddress: String,
  paymentMethod: { type: String, enum: ["cod", "bank_transfer"], default: "cod" },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending","confirmed","preparing","shipping","completed","cancelled"], default: "pending" },
  note: String
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
