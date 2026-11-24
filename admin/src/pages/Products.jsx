import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteProduct,
  getProducts,
} from "../services/productService";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("ALL");
  const [stockFilter, setStockFilter] =
    useState("ALL");

  // =========================================
  // LOAD LẦN ĐẦU
  // =========================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setMessage("");

        const data = await getProducts();

        setProducts(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Load products error:",
          error
        );

        setMessage(
          error.response?.data?.message ||
            "Không thể tải danh sách sản phẩm"
        );

        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =========================================
  // LOAD LẠI - DÙNG CHO NÚT LÀM MỚI
  // =========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getProducts();

      setProducts(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Reload products error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Không thể tải danh sách sản phẩm"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product._id);

      const response =
        await deleteProduct(product._id);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (item) =>
            item._id !== product._id
        )
      );

      setMessage(
        response?.message ||
          "Xóa sản phẩm thành công"
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Xóa sản phẩm thất bại"
      );

      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================
  // LẤY DANH SÁCH CATEGORY TỪ PRODUCTS
  // =========================================

  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      if (
        product.category &&
        typeof product.category === "object" &&
        product.category._id
      ) {
        categoryMap.set(
          product.category._id,
          product.category.name
        );
      }
    });

    return Array.from(
      categoryMap.entries()
    ).map(([id, name]) => ({
      id,
      name,
    }));
  }, [products]);

  // =========================================
  // FILTER
  // =========================================

  const filteredProducts = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      // SEARCH

      const productName =
        product.name?.toLowerCase() || "";

      const productSlug =
        product.slug?.toLowerCase() || "";

      const matchSearch =
        !keyword ||
        productName.includes(keyword) ||
        productSlug.includes(keyword);

      // CATEGORY

      const categoryId =
        typeof product.category === "object"
          ? product.category?._id
          : product.category;

      const matchCategory =
        categoryFilter === "ALL" ||
        categoryId === categoryFilter;

      // STOCK

      let matchStock = true;

      if (stockFilter === "IN_STOCK") {
        matchStock =
          Number(product.stock) > 0;
      }

      if (
        stockFilter === "OUT_OF_STOCK"
      ) {
        matchStock =
          Number(product.stock) <= 0;
      }

      return (
        matchSearch &&
        matchCategory &&
        matchStock
      );
    });
  }, [
    products,
    search,
    categoryFilter,
    stockFilter,
  ]);

  // =========================================
  // FORMAT PRICE
  // =========================================

  const formatPrice = (price) => {
    const number = Number(price);

    if (Number.isNaN(number)) {
      return "0 ₫";
    }

    return `${number.toLocaleString(
      "vi-VN"
    )} ₫`;
  };

  // =========================================
  // STATISTICS
  // =========================================

  const totalProducts = products.length;

  const totalInStock = products.filter(
    (product) =>
      Number(product.stock) > 0
  ).length;

  const totalOutOfStock = products.filter(
    (product) =>
      Number(product.stock) <= 0
  ).length;

  const totalFeatured = products.filter(
    (product) =>
      product.isFeatured === true
  ).length;

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="products-page">

      {/* ================= HEADER ================= */}

      <div className="page-title">

        <div>
          <h1>Quản lý sản phẩm</h1>

          <p>
            Quản lý toàn bộ sản phẩm của
            SmartCart
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            navigate("/products/add")
          }
        >
          + Thêm sản phẩm
        </button>

      </div>

      {/* ================= MESSAGE ================= */}

      {message && (
        <div
          className={
            messageType === "success"
              ? "alert alert-success"
              : "alert alert-error"
          }
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

      {/* ================= FILTER ================= */}

      <div className="product-toolbar">

        <div className="search-box">

          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        {/* CATEGORY */}

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(
              event.target.value
            )
          }
        >
          <option value="ALL">
            Tất cả danh mục
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        {/* STOCK */}

        <select
          value={stockFilter}
          onChange={(event) =>
            setStockFilter(
              event.target.value
            )
          }
        >
          <option value="ALL">
            Tất cả tồn kho
          </option>

          <option value="IN_STOCK">
            Còn hàng
          </option>

          <option value="OUT_OF_STOCK">
            Hết hàng
          </option>

        </select>

        {/* REFRESH */}

        <button
          type="button"
          className="refresh-button"
          onClick={loadProducts}
          disabled={loading}
        >
          {loading
            ? "Đang tải..."
            : "Làm mới"}
        </button>

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="product-summary">

        <div className="summary-item">
          <span>Tổng sản phẩm</span>
          <strong>
            {totalProducts}
          </strong>
        </div>

        <div className="summary-item">
          <span>Còn hàng</span>
          <strong>
            {totalInStock}
          </strong>
        </div>

        <div className="summary-item">
          <span>Hết hàng</span>
          <strong>
            {totalOutOfStock}
          </strong>
        </div>

        <div className="summary-item">
          <span>Sản phẩm nổi bật</span>
          <strong>
            {totalFeatured}
          </strong>
        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="content-card">

        <div className="table-header">

          <div>
            <h3>
              Danh sách sản phẩm
            </h3>

            {!loading && (
              <span>
                Hiển thị{" "}
                {filteredProducts.length}
                {" / "}
                {products.length} sản phẩm
              </span>
            )}
          </div>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="product-loading">
            Đang tải danh sách sản phẩm...
          </div>

        ) : filteredProducts.length ===
          0 ? (

          /* EMPTY */

          <div className="product-empty">

            <h3>
              Không có sản phẩm
            </h3>

            <p>
              Không tìm thấy sản phẩm phù
              hợp.
            </p>

          </div>

        ) : (

          /* TABLE */

          <div className="table-responsive">

            <table className="product-table">

              <thead>

                <tr>
                  <th>Ảnh</th>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Nổi bật</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>

              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => {

                    const inStock =
                      Number(
                        product.stock
                      ) > 0;

                    return (
                      <tr
                        key={product._id}
                      >

                        {/* IMAGE */}

                        <td>

                          <div className="product-image-wrapper">

                            {product.image ? (
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                                className="product-image"
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";

                                  event.currentTarget
                                    .nextElementSibling
                                    ?.classList.remove(
                                      "hidden"
                                    );
                                }}
                              />
                            ) : null}

                            <div
                              className={`product-image-placeholder ${
                                product.image
                                  ? "hidden"
                                  : ""
                              }`}
                            >
                              No image
                            </div>

                          </div>

                        </td>

                        {/* NAME */}

                        <td>

                          <div className="product-name-cell">

                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            {product.slug && (
                              <small>
                                {
                                  product.slug
                                }
                              </small>
                            )}

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td>

                          <span className="category-badge">

                            {typeof product.category ===
                            "object"
                              ? product
                                  .category
                                  ?.name ||
                                "Chưa có"
                              : "Chưa có"}

                          </span>

                        </td>

                        {/* PRICE */}

                        <td>

                          <strong>
                            {formatPrice(
                              product.price
                            )}
                          </strong>

                        </td>

                        {/* STOCK */}

                        <td>

                          <span
                            className={
                              inStock
                                ? "stock-normal"
                                : "stock-empty"
                            }
                          >
                            {product.stock ??
                              0}
                          </span>

                        </td>

                        {/* FEATURED */}

                        <td>

                          {product.isFeatured ? (
                            <span className="featured-yes">
                              ★ Có
                            </span>
                          ) : (
                            <span className="featured-no">
                              Không
                            </span>
                          )}

                        </td>

                        {/* STATUS */}

                        <td>

                          {inStock ? (
                            <span className="status-badge status-active">
                              Còn hàng
                            </span>
                          ) : (
                            <span className="status-badge status-out">
                              Hết hàng
                            </span>
                          )}

                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="action-buttons">

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                navigate(
                                  `/products/edit/${product._id}`
                                )
                              }
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              disabled={
                                deletingId ===
                                product._id
                              }
                              onClick={() =>
                                handleDelete(
                                  product
                                )
                              }
                            >
                              {deletingId ===
                              product._id
                                ? "Đang xóa..."
                                : "Xóa"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Products;