import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "../services/categoryService";
import { createProduct } from "../services/productService";
import { uploadImage } from "../services/uploadService";

function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] =
    useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [imageFile, setImageFile] =
    useState(null);

  const [previewImage, setPreviewImage] =
    useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    isFeatured: false,
  });

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const data =
          await getCategories();

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Load categories error:",
          error
        );

        setMessage(
          error.response?.data?.message ||
            "Không thể tải danh mục"
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ==========================================
  // CLEAN PREVIEW URL
  // ==========================================

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(
          previewImage
        );
      }
    };
  }, [previewImage]);

  // ==========================================
  // INPUT CHANGE
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
  // IMAGE CHANGE
  // ==========================================

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      setMessage(
        "Chỉ hỗ trợ ảnh JPG, JPEG, PNG hoặc WEBP"
      );

      event.target.value = "";

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage(
        "Dung lượng ảnh không được vượt quá 5MB"
      );

      event.target.value = "";

      return;
    }

    setMessage("");

    setImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setPreviewImage(previewUrl);
  };

  // ==========================================
  // VALIDATE
  // ==========================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Vui lòng nhập tên sản phẩm";
    }

    if (formData.price === "") {
      return "Vui lòng nhập giá sản phẩm";
    }

    const price =
      Number(formData.price);

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      return "Giá sản phẩm không hợp lệ";
    }

    if (!formData.category) {
      return "Vui lòng chọn danh mục";
    }

    if (formData.stock !== "") {
      const stock =
        Number(formData.stock);

      if (
        Number.isNaN(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
      ) {
        return "Tồn kho phải là số nguyên lớn hơn hoặc bằng 0";
      }
    }

    return null;
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      setSubmitting(true);

      // ------------------------------------------
      // 1. UPLOAD IMAGE
      // ------------------------------------------

      let imageUrl = "";

      if (imageFile) {
        imageUrl =
          await uploadImage(
            imageFile
          );
      }

      // ------------------------------------------
      // 2. BUILD PRODUCT REQUEST
      // ------------------------------------------

      const productData = {
        name:
          formData.name.trim(),

        description:
          formData.description.trim(),

        price:
          Number(formData.price),

        stock:
          formData.stock === ""
            ? 0
            : Number(
                formData.stock
              ),

        category:
          formData.category,

        image:
          imageUrl,

        isFeatured:
          formData.isFeatured,
      };

      console.log(
        "Create product request:",
        productData
      );

      // ------------------------------------------
      // 3. CREATE PRODUCT
      // ------------------------------------------

      const response =
        await createProduct(
          productData
        );

      alert(
        response.message ||
          "Thêm sản phẩm thành công"
      );

      // ------------------------------------------
      // 4. BACK TO PRODUCTS
      // ------------------------------------------

      navigate("/products");
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Thêm sản phẩm thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="product-form-page">

      {/* HEADER */}

      <div className="page-title">

        <div>
          <h1>Thêm sản phẩm</h1>

          <p>
            Thêm sản phẩm mới vào
            SmartCart
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

      {/* ERROR */}

      {message && (
        <div className="alert alert-error">

          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >
            ×
          </button>

        </div>
      )}

      {/* FORM */}

      <form
        className="product-form"
        onSubmit={handleSubmit}
      >

        <div className="product-form-grid">

          {/* LEFT */}

          <div className="form-card">

            <h3>
              Thông tin sản phẩm
            </h3>

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
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                placeholder="Ví dụ: iPhone 16 Pro Max"
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
                onChange={
                  handleChange
                }
                placeholder="Nhập mô tả sản phẩm..."
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
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
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
                  step="1"
                  value={
                    formData.stock
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
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
                value={
                  formData.category
                }
                onChange={
                  handleChange
                }
                disabled={
                  submitting ||
                  loadingCategories
                }
              >

                <option value="">
                  {loadingCategories
                    ? "Đang tải danh mục..."
                    : "-- Chọn danh mục --"}
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category._id
                      }
                      value={
                        category._id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}

              </select>

              {!loadingCategories &&
                categories.length === 0 && (
                  <small>
                    Chưa có danh mục.
                    Hãy tạo danh mục trước
                    khi thêm sản phẩm.
                  </small>
                )}

            </div>

            {/* FEATURED */}

            <label className="checkbox-group">

              <input
                type="checkbox"
                name="isFeatured"
                checked={
                  formData.isFeatured
                }
                onChange={
                  handleChange
                }
                disabled={submitting}
              />

              <span>
                Sản phẩm nổi bật
              </span>

            </label>

          </div>

          {/* RIGHT */}

          <div className="form-card">

            <h3>
              Hình ảnh sản phẩm
            </h3>

            <div className="image-upload">

              {previewImage ? (

                <img
                  src={previewImage}
                  alt="Xem trước sản phẩm"
                  className="image-preview"
                />

              ) : (

                <div className="image-preview-empty">

                  <span>
                    🖼️
                  </span>

                  <p>
                    Chưa chọn ảnh
                  </p>

                </div>

              )}

              <label
                className="upload-button"
                htmlFor="product-image"
              >
                Chọn ảnh
              </label>

              <input
                id="product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                disabled={submitting}
                hidden
              />

              {imageFile && (
                <div className="selected-image-info">

                  <strong>
                    {
                      imageFile.name
                    }
                  </strong>

                  <small>
                    {(
                      imageFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}
                    {" MB"}
                  </small>

                </div>
              )}

              <small>
                JPG, JPEG, PNG hoặc
                WEBP. Tối đa 5MB.
              </small>

            </div>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="form-actions">

          <button
            type="button"
            className="cancel-button"
            disabled={submitting}
            onClick={() =>
              navigate("/products")
            }
          >
            Hủy
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={
              submitting ||
              loadingCategories ||
              categories.length === 0
            }
          >
            {submitting
              ? "Đang thêm sản phẩm..."
              : "Thêm sản phẩm"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default AddProduct;