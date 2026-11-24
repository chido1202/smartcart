
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    transactionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "BANK_TRANSFER"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    note: {
      type: String,
      default: "",
    },

    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "pay",
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
