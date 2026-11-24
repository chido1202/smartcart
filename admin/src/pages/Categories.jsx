import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteCategory,
  getCategories,
} from "../services/categoryService";

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ==========================================
  // LOAD CATEGORIES - DÙNG CHO NÚT LÀM MỚI
  // ==========================================

  const loadCategories = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getCategories();

      setCategories(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error("Load categories error:", error);

      setMessage(
        error.response?.data?.message ||
          "Không thể tải danh sách danh mục"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD LẦN ĐẦU
  // ==========================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const data = await getCategories();

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error("Load categories error:", error);

        setMessage(
          error.response?.data?.message ||
            "Không thể tải danh sách danh mục"
        );

        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category._id);
      setMessage("");

      const response = await deleteCategory(
        category._id
      );

      setCategories((current) =>
        current.filter(
          (item) => item._id !== category._id
        )
      );

      setMessage(
        response?.message ||
          "Xóa danh mục thành công"
      );

      setMessageType("success");
    } catch (error) {
      console.error("Delete category error:", error);

      setMessage(
        error.response?.data?.message ||
          "Xóa danh mục thất bại"
      );

      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="categories-page">
      {/* HEADER */}

      <div className="page-title">
        <div>
          <h1>Danh mục</h1>

          <p>
            Quản lý danh mục sản phẩm SmartCart
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            navigate("/categories/add")
          }
        >
          + Thêm danh mục
        </button>
      </div>

      {/* MESSAGE */}

      {message && (
        <div
          className={`alert ${
            messageType === "success"
              ? "alert-success"
              : "alert-error"
          }`}
        >
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}

      {/* CONTENT */}

      <div className="content-card">
        <div className="table-header">
          <div>
            <h3>Danh sách danh mục</h3>

            <span>
              {categories.length} danh mục
            </span>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={loadCategories}
            disabled={loading}
          >
            ↻ Làm mới
          </button>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="category-loading">
            Đang tải danh mục...
          </div>
        ) : categories.length === 0 ? (
          /* EMPTY */

          <div className="category-empty">
            <h3>Chưa có danh mục</h3>

            <p>
              Hãy tạo danh mục đầu tiên để thêm
              sản phẩm.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                navigate("/categories/add")
              }
            >
              + Thêm danh mục
            </button>
          </div>
        ) : (
          /* TABLE */

          <div className="table-responsive">
            <table className="category-table">
              <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Slug</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>
                      <strong>
                        {category.name}
                      </strong>
                    </td>

                    <td>
                      <span className="category-slug">
                        {category.slug || "-"}
                      </span>
                    </td>

                    <td>
                      <span className="category-description">
                        {category.description ||
                          "Không có mô tả"}
                      </span>
                    </td>

                    <td>
                      {category.isActive === false ? (
                        <span className="status-badge status-inactive">
                          Ngừng hoạt động
                        </span>
                      ) : (
                        <span className="status-badge status-active">
                          Hoạt động
                        </span>
                      )}
                    </td>

                    <td>
                          <div className="action-buttons">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            navigate(`/categories/edit/${category._id}`)
                          }
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          disabled={
                            deletingId === category._id
                          }
                          onClick={() =>
                            handleDelete(category)
                          }
                        >
                          {deletingId === category._id
                            ? "Đang xóa..."
                            : "Xóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;