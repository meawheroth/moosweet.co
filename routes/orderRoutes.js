const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { createOrder, getHistory, getAllOrders, updateOrderStatus } = require("../controllers/orderController");

router.use(protect);
router.post("/", createOrder);
router.get("/history", getHistory);
router.get("/admin", adminOnly, getAllOrders);
router.patch("/:id/status", adminOnly, updateOrderStatus);

module.exports = router;
