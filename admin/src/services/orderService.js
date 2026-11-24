
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

async function request(path = "", options = {}) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error(
      "Bạn chưa đăng nhập. Vui lòng đăng nhập Admin."
    );
  }

  const response = await fetch(
    `${API_URL}/api/admin/orders${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
      "Không thể thực hiện yêu cầu"
    );
  }

  return result;
}

export const orderService = {
  // Danh sách đơn hàng
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`?${query.toString()}`);
  },

  // Thống kê đơn hàng
  getStats: () => request("/stats"),

  // Chi tiết đơn hàng
  getById: (id) => request(`/${id}`),

  // Cập nhật trạng thái
  updateStatus: (id, status) =>
    request(`/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
