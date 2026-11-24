import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setMessage("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    if (formData.password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      navigate("/login", {
        state: {
          message: "Đăng ký thành công. Vui lòng đăng nhập.",
        },
      });
    } catch (error) {
      console.error("Register error:", error);

      setMessage(
        error.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <h1>SmartCart</h1>

          <h2>Tạo tài khoản mới</h2>

          <p>
            Đăng ký tài khoản để bắt đầu mua sắm cùng SmartCart.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {message && (
            <div className="auth-alert">
              {message}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="fullName">
              Họ và tên
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="phone">
              Số điện thoại
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0987654321"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">
              Mật khẩu
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">
              Xác nhận mật khẩu
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <p className="auth-switch">
            Đã có tài khoản?{" "}
            <Link to="/login">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;