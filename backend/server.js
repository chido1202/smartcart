const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const categoryRoutes = require("./routes/categoryRoutes");
const path = require("path");
const uploadRoutes = require("./routes/uploadRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/upload", uploadRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/payments", paymentRoutes);
// API kiểm tra server
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SmartCart API is running",
  });
});

const PORT = process.env.PORT || 5000;
app.use("/api/admin/payments", paymentRoutes);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});