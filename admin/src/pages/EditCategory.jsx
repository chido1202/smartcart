import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getCategoryById,
  updateCategory,
} from "../services/categoryService";

function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);

        const category = await getCategoryById(id);

        setFormData({
          name: category?.name || "",
          description: category?.description || "",
        });
      } catch (error) {
        console.error("Load category error:", error);

        setMessage(
          error.response?.data?.message ||
            "Không thể tải thông tin danh mục"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

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

      await updateCategory(id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      alert("Cập nhật danh mục thành công");

      navigate("/categories");
    } catch (error) {
      console.error("Update category error:", error);

      setMessage(
        error.response?.data?.message ||
          "Cập nhật danh mục thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="category-loading">
        Đang tải thông tin danh mục...
      </div>
    );
  }

  return (
    <div className="category-form-page">
      <div className="page-title">
        <div>
          <h1>Sửa danh mục</h1>
          <p>Cập nhật thông tin danh mục sản phẩm</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/categories")}
        >
          ← Quay lại
        </button>
      </div>

      {message && (
        <div className="alert alert-error">
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
          >
            ×
          </button>
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
                ? "Đang cập nhật..."
                : "Cập nhật danh mục"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditCategory;