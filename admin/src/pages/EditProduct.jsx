import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getProductById,
  updateProduct,
} from "../services/productService";

import {
  getCategories,
} from "../services/categoryService";

import {
  uploadImage,
} from "../services/uploadService";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: "",
    isFeatured: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  // ==========================================
  // LOAD PRODUCT + CATEGORY
  // ==========================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          product,
          categoryList,
        ] = await Promise.all([
          getProductById(id),
          getCategories(),
        ]);

        setCategories(
          Array.isArray(categoryList)
            ? categoryList
            : []
        );

        const categoryId =
          typeof product.category === "object"
            ? product.category?._id
            : product.category;

        setFormData({
          name: product.name || "",
          description:
            product.description || "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          category: categoryId || "",
          image: product.image || "",
          isFeatured:
            product.isFeatured === true,
        });

        setPreview(product.image || "");
      } catch (error) {
        console.error(
          "Load product error:",
          error
        );

        setMessage(
          error.response?.data?.message ||
            "Không thể tải thông tin sản phẩm"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ==========================================
  // CHANGE INPUT
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================
  // CHANGE IMAGE
  // ==========================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP"
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage(
        "Dung lượng ảnh không được vượt quá 5MB"
      );
      return;
    }

    setMessage("");
    setImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setPreview(previewUrl);
  };

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!formData.name.trim()) {
      setMessage(
        "Vui lòng nhập tên sản phẩm"
      );
      return;
    }

    if (!formData.category) {
      setMessage(
        "Vui lòng chọn danh mục"
      );
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      setMessage("Giá sản phẩm không hợp lệ");
      return;
    }

    if (
      Number.isNaN(stock) ||
      stock < 0
    ) {
      setMessage("Tồn kho không hợp lệ");
      return;
    }

    try {
      setSubmitting(true);

      let imageUrl = formData.image;

      // Có chọn ảnh mới thì upload lại
      if (imageFile) {
        imageUrl =
          await uploadImage(imageFile);
      }

      const productData = {
        name: formData.name.trim(),

        description:
          formData.description.trim(),

        price,
        stock,

        category: formData.category,

        image: imageUrl,

        isFeatured:
          formData.isFeatured,
      };

      console.log(
        "Update product request:",
        productData
      );

      await updateProduct(
        id,
        productData
      );

      alert(
        "Cập nhật sản phẩm thành công"
      );

      navigate("/products");
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Cập nhật sản phẩm thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="product-form-page">
        <div className="category-loading">
          Đang tải thông tin sản phẩm...
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="product-form-page">

      <div className="page-title">
        <div>
          <h1>Sửa sản phẩm</h1>

          <p>
            Cập nhật thông tin sản phẩm
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate("/products")
          }
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
        className="product-form"
        onSubmit={handleSubmit}
      >

        <div className="product-form-grid">

          {/* LEFT */}

          <div className="form-card">

            <h3>Thông tin sản phẩm</h3>

            {/* NAME */}

            <div className="form-group">
              <label htmlFor="name">
                Tên sản phẩm
                <span>*</span>
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

            {/* DESCRIPTION */}

            <div className="form-group">
              <label htmlFor="description">
                Mô tả
              </label>

              <textarea
                id="description"
                name="description"
                rows="6"
                value={
                  formData.description
                }
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            {/* PRICE + STOCK */}

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="price">
                  Giá
                  <span>*</span>
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">
                  Tồn kho
                </label>

                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

            </div>

            {/* CATEGORY */}

            <div className="form-group">
              <label htmlFor="category">
                Danh mục
                <span>*</span>
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">
                  -- Chọn danh mục --
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* FEATURED */}

            <div className="form-group">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={
                    formData.isFeatured
                  }
                  onChange={handleChange}
                  disabled={submitting}
                />

                Sản phẩm nổi bật
              </label>
            </div>

          </div>

          {/* RIGHT IMAGE */}

          <div className="form-card">

            <h3>Hình ảnh sản phẩm</h3>

            <div className="image-upload">

              {preview ? (
                <img
                  src={preview}
                  alt="Product preview"
                  className="image-preview"
                />
              ) : (
                <div className="image-preview-empty">
                  <span>🖼</span>

                  <p>Chưa có hình ảnh</p>
                </div>
              )}

              <label className="upload-button">
                Chọn ảnh mới

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  disabled={submitting}
                  hidden
                />
              </label>

              {imageFile && (
                <div className="selected-image-info">
                  <strong>
                    {imageFile.name}
                  </strong>

                  <small>
                    Ảnh mới sẽ được upload
                    khi cập nhật sản phẩm
                  </small>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* ACTION */}

        <div className="form-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={() =>
              navigate("/products")
            }
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
              : "Cập nhật sản phẩm"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default EditProduct;