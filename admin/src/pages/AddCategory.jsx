import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createCategory } from "../services/categoryService";

function AddCategory() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
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

    if (!formData.name.trim()) {
      setMessage("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setSubmitting(true);

      const request = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      await createCategory(request);

      alert("Thêm danh mục thành công");

      navigate("/categories");
    } catch (error) {
      console.error("Create category error:", error);

      setMessage(
        error.response?.data?.message ||
          "Thêm danh mục thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="category-form-page">
      <div className="page-title">
        <div>
          <h1>Thêm danh mục</h1>
          <p>Tạo danh mục sản phẩm mới</p>
        </div>
      </div>

      {message && (
        <div className="alert alert-error">
          {message}
        </div>
      )}

      <form
        className="category-create-form"
        onSubmit={handleSubmit}
      >
        <div className="form-card">
          <h3>Thông tin danh mục</h3>

          <div className="form-group">
            <label htmlFor="name">
              Tên danh mục <span>*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Ví dụ: Điện thoại"
              value={formData.name}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Mô tả
            </label>

            <textarea
              id="description"
              name="description"
              rows="6"
              placeholder="Nhập mô tả danh mục..."
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/categories")}
              disabled={submitting}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? "Đang thêm..."
                : "Thêm danh mục"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddCategory;