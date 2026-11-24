const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  adminOnly,
} = require("../middleware/adminMiddleware");

const router = express.Router();

// Customer và Admin đều xem được
router.get("/", getProducts);
router.get("/:id", getProductById);

// Chỉ Admin
router.post("/", protect, adminOnly, createProduct);

router.put("/:id", protect, adminOnly, updateProduct);

router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;