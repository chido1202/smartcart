
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

// GET /api/admin/payments
exports.getPayments = async (req, res) => {
  try {
    const {
      search = "",
      status = "ALL",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(limit) || 10)
    );

    const filter = {};

    if (["PENDING", "SUCCESS", "FAILED", "REFUNDED"].includes(status)) {
      filter.status = status;
    }

    if (search.trim()) {
      const escaped = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const matchingOrders = await Order.find({
        $or: [
          { orderCode: { $regex: escaped, $options: "i" } },
          { customerName: { $regex: escaped, $options: "i" } },
        ],
      }).select("_id");

      filter.$or = [
        {
          transactionCode: {
            $regex: escaped,
            $options: "i",
          },
        },
        {
          order: {
            $in: matchingOrders.map((order) => order._id),
          },
        },
      ];
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("order", "orderCode customerName phone totalAmount")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Payment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/admin/payments/stats
exports.getPaymentStats = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    const stats = {
      total: 0,
      PENDING: 0,
      SUCCESS: 0,
      FAILED: 0,
      REFUNDED: 0,
      totalReceived: 0,
    };

    result.forEach((item) => {
      stats[item._id] = item.count;
      stats.total += item.count;

      if (item._id === "SUCCESS") {
        stats.totalReceived = item.amount;
      }
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/admin/payments/:id
exports.getPaymentById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID giao dịch không hợp lệ",
      });
    }

    const payment = await Payment.findById(req.params.id)
      .populate("order")
      .populate("confirmedBy", "name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giao dịch",
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/admin/payments/:id/confirm
exports.confirmPayment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID giao dịch không hợp lệ",
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giao dịch",
      });
    }

    if (payment.paymentMethod !== "BANK_TRANSFER") {
      return res.status(400).json({
        success: false,
        message: "Chỉ xác nhận thủ công cho chuyển khoản",
      });
    }

    if (payment.status !== "PENDING") {
      return res.status(409).json({
        success: false,
        message: "Giao dịch không ở trạng thái chờ",
      });
    }

    const order = await Order.findById(payment.order);

    if (!order || order.orderStatus === "CANCELLED") {
      return res.status(409).json({
        success: false,
        message: "Đơn hàng không tồn tại hoặc đã hủy",
      });
    }

    if (order.totalAmount !== payment.amount) {
      return res.status(409).json({
        success: false,
        message: "Số tiền thanh toán không khớp đơn hàng",
      });
    }

    // Chỉ cập nhật sau khi Admin đã đối soát tiền thực nhận.
    // Dùng transaction để cập nhật đồng bộ Payment và Order.
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const updated = await Payment.updateOne(
          { _id: payment._id, status: "PENDING" },
          {
            $set: {
              status: "SUCCESS",
              paidAt: new Date(),
              confirmedBy: req.user._id,
            },
          },
          { session }
        );

        if (updated.modifiedCount !== 1) {
          throw new Error("Giao dịch đã được xử lý");
        }

        await Order.updateOne(
          { _id: order._id, orderStatus: { $ne: "CANCELLED" } },
          { $set: { paymentStatus: "SUCCESS" } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    const updatedPayment = await Payment.findById(payment._id)
      .populate("order", "orderCode customerName totalAmount");

    res.json({
      success: true,
      message: "Xác nhận thanh toán thành công",
      data: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
