
import { useEffect, useState } from "react";
import { orderService } from "../services/orderService";

const statusConfig = {
  PENDING: { label: "Chờ xác nhận", className: "pending" },
  CONFIRMED: { label: "Đã xác nhận", className: "confirmed" },
  SHIPPING: { label: "Đang giao", className: "shipping" },
  COMPLETED: { label: "Hoàn thành", className: "completed" },
  CANCELLED: { label: "Đã hủy", className: "cancelled" },
};

const nextStatus = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPING",
  SHIPPING: "COMPLETED",
};

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value ?? 0);

const dateFormat = (value) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN")
    : "—";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const [list, summary] = await Promise.all([
          orderService.getOrders({
            search,
            status: statusFilter,
            page,
            limit: 5,
          }),
          orderService.getStats(),
        ]);

        if (!active) return;

        setOrders(list.data || []);
        setStats(summary.data || {});
        setTotalPages(
          Math.max(1, list.pagination?.totalPages || 1)
        );
      } catch (err) {
        if (active) {
          setOrders([]);
          setError(err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [search, statusFilter, page]);

  const refreshOrders = async () => {
    const [list, summary] = await Promise.all([
      orderService.getOrders({
        search,
        status: statusFilter,
        page,
        limit: 5,
      }),
      orderService.getStats(),
    ]);

    setOrders(list.data || []);
    setStats(summary.data || {});
    setTotalPages(
      Math.max(1, list.pagination?.totalPages || 1)
    );
  };

  const openDetail = async (id) => {
    try {
      setError("");
      const result = await orderService.getById(id);
      setSelectedOrder(result.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (status) => {
    if (!selectedOrder || saving) return;

    const confirmed = window.confirm(
      `Xác nhận chuyển đơn ${selectedOrder.orderCode} sang "${
        statusConfig[status].label
      }"?`
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const result = await orderService.updateStatus(
        selectedOrder._id,
        status
      );

      setSelectedOrder(result.data);
      await refreshOrders();
      alert("Cập nhật đơn hàng thành công!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-heading">
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>Danh sách và cập nhật trạng thái đơn hàng.</p>
        </div>
        <span className="orders-total">
          Tổng cộng: {stats.total || 0} đơn hàng
        </span>
      </div>

      <div className="orders-stats">
        {[
          ["Tổng đơn hàng", stats.total || 0, "all"],
          ["Chờ xác nhận", stats.PENDING || 0, "pending"],
          ["Đang giao", stats.SHIPPING || 0, "shipping"],
          ["Hoàn thành", stats.COMPLETED || 0, "completed"],
        ].map(([label, value, type]) => (
          <div className="orders-stat-card" key={label}>
            <span>{label}</span>
            <strong className={`stat-${type}`}>
              {value}
            </strong>
          </div>
        ))}
      </div>

      <div className="orders-panel">
        <div className="orders-toolbar">
          <input
            placeholder="Tìm mã đơn hàng hoặc khách hàng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(statusConfig).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p role="alert" style={{ color: "red", padding: 20 }}>
            {error}
          </p>
        )}

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="orders-empty">
                    Đang tải đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="orders-empty">
                    Không có đơn hàng.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">
                      {order.orderCode}
                    </td>
                    <td>{order.customerName}</td>
                    <td>{dateFormat(order.createdAt)}</td>
                    <td className="order-price">
                      {money(order.totalAmount)}
                    </td>
                    <td>
                      {order.paymentMethod === "COD"
                        ? "Tiền mặt"
                        : "Chuyển khoản"}
                    </td>
                    <td>
                      <span
                        className={`order-status ${
                          statusConfig[order.orderStatus]
                            ?.className || ""
                        }`}
                      >
                        {statusConfig[order.orderStatus]
                          ?.label || order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        className="order-view-btn"
                        onClick={() => openDetail(order._id)}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="orders-pagination">
          <span>Trang {page} / {totalPages}</span>
          <div>
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div
          className="order-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-modal-header">
              <h2>
                Chi tiết đơn hàng {selectedOrder.orderCode}
              </h2>
              <button onClick={() => setSelectedOrder(null)}>
                ×
              </button>
            </div>

            <div className="order-modal-body">
              <h3>Thông tin khách hàng</h3>
              <p>
                <b>Họ tên:</b> {selectedOrder.customerName}
              </p>
              <p>
                <b>Số điện thoại:</b> {selectedOrder.phone}
              </p>
              <p>
                <b>Địa chỉ:</b>{" "}
                {[
                  selectedOrder.shippingAddress?.street,
                  selectedOrder.shippingAddress?.ward,
                  selectedOrder.shippingAddress?.city,
                ].filter(Boolean).join(", ")}
              </p>
              <p>
                <b>Thanh toán:</b>{" "}
                {selectedOrder.paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : "Chuyển khoản"}
              </p>

              <h3>Sản phẩm đã đặt</h3>
              <div className="orders-table-wrapper">
                <table className="order-detail-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>SL</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{money(item.price)}</td>
                        <td>
                          {money(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="order-detail-total">
                Tổng tiền: {money(selectedOrder.totalAmount)}
              </div>

              <h3>Trạng thái đơn hàng</h3>
              <span
                className={`order-status ${
                  statusConfig[selectedOrder.orderStatus]
                    ?.className || ""
                }`}
              >
                {statusConfig[selectedOrder.orderStatus]
                  ?.label || selectedOrder.orderStatus}
              </span>

              <h3>Lịch sử cập nhật</h3>
              {selectedOrder.statusHistory?.length ? (
                <ul>
                  {selectedOrder.statusHistory.map((item, index) => (
                    <li key={index}>
                      {dateFormat(item.changedAt)} —{" "}
                      {statusConfig[item.to]?.label || item.to}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Chưa có lịch sử thay đổi.</p>
              )}
            </div>

            <div className="order-modal-footer">
              {nextStatus[selectedOrder.orderStatus] && (
                <button
                  className="order-confirm-btn"
                  disabled={saving}
                  onClick={() =>
                    updateStatus(
                      nextStatus[selectedOrder.orderStatus]
                    )
                  }
                >
                  {saving
                    ? "Đang xử lý..."
                    : `Chuyển sang ${
                        statusConfig[
                          nextStatus[selectedOrder.orderStatus]
                        ].label
                      }`}
                </button>
              )}

              {["PENDING", "CONFIRMED"].includes(
                selectedOrder.orderStatus
              ) && (
                <button
                  className="order-cancel-btn"
                  disabled={saving}
                  onClick={() => updateStatus("CANCELLED")}
                >
                  Hủy đơn
                </button>
              )}

              <button
                className="order-close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
