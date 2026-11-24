const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@smartcart.com";

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Tài khoản Admin đã tồn tại");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.create({
      fullName: "SmartCart Admin",
      email: adminEmail,
      password: hashedPassword,
      phone: "0900000000",
      role: "admin",
    });

    console.log("Tạo tài khoản Admin thành công");
    console.log("Email: admin@smartcart.com");
    console.log("Mật khẩu: 123456");

    process.exit(0);
  } catch (error) {
    console.error("Không thể tạo Admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();