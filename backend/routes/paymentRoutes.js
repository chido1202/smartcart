
const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Tất cả API thanh toán chỉ dành cho Admin
router.use(protect, adminOnly);

// GET - Danh sách thanh toán
router.get("/", paymentController.getPayments);

// GET - Thống kê thanh toán
router.get("/stats", paymentController.getPaymentStats);

// GET - Chi tiết thanh toán
router.get("/:id", paymentController.getPaymentById);

// PATCH - Xác nhận thanh toán chuyển khoản
router.patch(
  "/:id/confirm",
  paymentController.confirmPayment
);

module.exports = router;
