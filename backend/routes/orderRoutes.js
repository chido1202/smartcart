
const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Tất cả API bên dưới đều yêu cầu đăng nhập
router.use(protect);

// TODO: Gắn middleware kiểm tra quyền Admin
// sau khi xác nhận cách export của adminMiddleware.js

// Thống kê đơn hàng
router.get("/stats", orderController.getOrderStats);

// Danh sách đơn hàng
router.get("/", orderController.getOrders);

// Chi tiết đơn hàng
router.get("/:id", orderController.getOrderById);

// Cập nhật trạng thái đơn hàng
router.patch(
  "/:id/status",
  orderController.updateOrderStatus
);

module.exports = router;
