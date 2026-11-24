
const mongoose = require("mongoose");
const Order = require("../models/Order");

const transitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getOrders = async (req, res) => {
  try {
    const {
      search = "",
      status = "ALL",
      page = "1",
      limit = "10",
    } = req.query;

    const currentPage = Math.max(
      1,
      Number.parseInt(page, 10) || 1
    );

    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 10)
    );

    const filter = {};

    if (search.trim()) {
      const regex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      filter.$or = [
        { orderCode: regex },
        { customerName: regex },
      ];
    }

    if (status !== "ALL") {
      if (!Object.hasOwn(transitions, status)) {
        return res.status(400).json({
          message: "Trạng thái không hợp lệ",
        });
      }

      filter.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("getOrders:", error);
    return res.status(500).json({
      message: "Không thể tải danh sách đơn hàng",
    });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const [total, grouped] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const counts = {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    grouped.forEach((item) => {
      if (Object.hasOwn(counts, item._id)) {
        counts[item._id] = item.count;
      }
    });

    return res.json({
      success: true,
      data: { total, ...counts },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Không thể tải thống kê",
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "ID đơn hàng không hợp lệ",
      });
    }

    const order = await Order.findById(
      req.params.id
    ).lean();

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Không thể tải chi tiết đơn hàng",
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID đơn hàng không hợp lệ",
      });
    }

    if (!Object.hasOwn(transitions, status)) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ",
      });
    }

    // Chỉ cập nhật khi trạng thái hiện tại
    // nằm trong tập trạng thái cho phép.
    const allowedPrevious = Object.keys(
      transitions
    ).filter((key) =>
      transitions[key].includes(status)
    );

    const order = await Order.findOneAndUpdate(
      {
        _id: id,
        orderStatus: { $in: allowedPrevious },
      },
      [
        {
          $set: {
            statusHistory: {
              $concatArrays: [
                { $ifNull: ["$statusHistory", []] },
                [
                  {
                    from: "$orderStatus",
                    to: status,
                    changedBy: {
                      $literal: String(
                        req.user?._id ||
                        req.user?.id ||
                        "ADMIN"
                      ),
                    },
                    changedAt: "$$NOW",
                    note: "Admin cập nhật trạng thái",
                  },
                ],
              ],
            },
            orderStatus: status,
            updatedAt: "$$NOW",
          },
        },
      ],
      { new: true }
    );

    if (!order) {
      const exists = await Order.exists({ _id: id });

      return res.status(exists ? 409 : 404).json({
        message: exists
          ? "Không thể chuyển trạng thái đơn hàng"
          : "Không tìm thấy đơn hàng",
      });
    }

    return res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: order,
    });
  } catch (error) {
    console.error("updateOrderStatus:", error);
    return res.status(500).json({
      message: "Không thể cập nhật trạng thái",
    });
  }
};
