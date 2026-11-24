
import { useCallback, useEffect, useState } from "react";
import { paymentService } from "../services/paymentService";

const STATUS = {
  PENDING: "Chờ thanh toán",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

const METHODS = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản",
};

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value ?? 0);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("vi-VN");
};

function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    SUCCESS: 0,
    PENDING: 0,
    FAILED: 0,
    REFUNDED: 0,
    totalReceived: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Hàm tải dữ liệu từ MongoDB thông qua backend
  const loadPayments = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const [list, summary] = await Promise.all([
        paymentService.getPayments({
          search,
          status,
          page,
          limit: 10,
        }),
        paymentService.getStats(),
      ]);

      if (signal?.aborted) return;

      setPayments(Array.isArray(list.data) ? list.data : []);
      setPagination(
        list.pagination || {
          page: 1,
          total: 0,
          totalPages: 1,
        }
      );
      setStats(summary.data || {});
    } catch (err) {
      if (signal?.aborted) return;

      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách thanh toán"
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [search, status, page]);

  
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    await loadPayments(controller.signal);
  };

  fetchData();

  return () => {
    controller.abort();
  };
}, [loadPayments]);


  // Xem chi tiết giao dịch
  const handleView = async (id) => {
    try {
      setError("");

      const result = await paymentService.getById(id);
      setSelected(result.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể xem chi tiết giao dịch"
      );
    }
  };

  // Xác nhận thanh toán chuyển khoản
  const handleConfirm = async () => {
    if (!selected || saving) return;

    if (
      selected.status !== "PENDING" ||
      selected.paymentMethod !== "BANK_TRANSFER"
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Bạn đã kiểm tra sao kê và xác nhận ngân hàng thực sự nhận đủ tiền cho giao dịch này?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await paymentService.confirmPayment(selected._id);

      setSelected(null);
      await loadPayments();

      alert("Xác nhận thanh toán thành công!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Xác nhận thanh toán thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="payments-page">
      {/* Tiêu đề */}
      <div className="payments-heading">
        <div>
          <h1>Quản lý thanh toán</h1>
          <p>
            Theo dõi và quản lý giao dịch thanh toán SmartCart.
          </p>
        </div>
      </div>

      {/* Thống kê */}
      <div className="payments-stats">
        {[
          ["Tổng giao dịch", stats.total ?? 0],
          ["Thành công", stats.SUCCESS ?? 0],
          ["Đang chờ", stats.PENDING ?? 0],
          ["Thất bại", stats.FAILED ?? 0],
        ].map(([label, value]) => (
          <div className="payments-stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {/* Danh sách thanh toán */}
      <div className="payments-panel">
        <div className="payments-toolbar">
          <input
            type="text"
            placeholder="Tìm mã giao dịch, đơn hàng, khách hàng..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>

            {Object.entries(STATUS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="payments-error" role="alert">
            {error}
          </p>
        )}

        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Mã giao dịch</th>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Phương thức</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    Không có giao dịch thanh toán.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.transactionCode}</td>

                    <td>
                      {payment.order?.orderCode || "—"}
                    </td>

                    <td>
                      {payment.order?.customerName || "—"}
                    </td>

                    <td>
                      {METHODS[payment.paymentMethod] ||
                        payment.paymentMethod}
                    </td>

                    <td>{formatMoney(payment.amount)}</td>

                    <td>
                      <span
                        className={`payment-status ${(
                          payment.status || "PENDING"
                        ).toLowerCase()}`}
                      >
                        {STATUS[payment.status] ||
                          payment.status}
                      </span>
                    </td>

                    <td>{formatDate(payment.createdAt)}</td>

                    <td>
                      <button
                        type="button"
                        className="payment-view-btn"
                        onClick={() => handleView(payment._id)}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="payments-pagination">
          <span>
            Trang {page} /{" "}
            {Math.max(1, pagination.totalPages || 1)}
          </span>

          <div>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Trước
            </button>

            <button
              type="button"
              disabled={
                page >= (pagination.totalPages || 1) ||
                loading
              }
              onClick={() => setPage((prev) => prev + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal chi tiết */}
      {selected && (
        <div
          className="payment-modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="payment-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Chi tiết thanh toán"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="payment-modal-header">
              <h2>Chi tiết thanh toán</h2>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="payment-modal-body">
              <p>
                <b>Mã giao dịch:</b>{" "}
                {selected.transactionCode}
              </p>

              <p>
                <b>Mã đơn hàng:</b>{" "}
                {selected.order?.orderCode || "—"}
              </p>

              <p>
                <b>Khách hàng:</b>{" "}
                {selected.order?.customerName || "—"}
              </p>

              <p>
                <b>Số điện thoại:</b>{" "}
                {selected.order?.phone || "—"}
              </p>

              <p>
                <b>Phương thức:</b>{" "}
                {METHODS[selected.paymentMethod] ||
                  selected.paymentMethod}
              </p>

              <p>
                <b>Số tiền:</b>{" "}
                {formatMoney(selected.amount)}
              </p>

              <p>
                <b>Trạng thái:</b>{" "}
                {STATUS[selected.status] ||
                  selected.status}
              </p>

              <p>
                <b>Ngày tạo:</b>{" "}
                {formatDate(selected.createdAt)}
              </p>

              <p>
                <b>Ngày thanh toán:</b>{" "}
                {formatDate(selected.paidAt)}
              </p>

              <p>
                <b>Ghi chú:</b>{" "}
                {selected.note || "Không có"}
              </p>
            </div>

            <div className="payment-modal-footer">
              {selected.status === "PENDING" &&
                selected.paymentMethod ===
                  "BANK_TRANSFER" && (
                  <button
                    type="button"
                    className="payment-confirm-btn"
                    disabled={saving}
                    onClick={handleConfirm}
                  >
                    {saving
                      ? "Đang xác nhận..."
                      : "Xác nhận đã nhận tiền"}
                  </button>
                )}

              <button
                type="button"
                className="payment-close-btn"
                onClick={() => setSelected(null)}
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

export default Payments;
