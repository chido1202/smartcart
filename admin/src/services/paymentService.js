
import api from "./api";

export const paymentService = {
  getPayments: async (params = {}) => {
    const response = await api.get("/admin/payments", {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/admin/payments/stats", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    return response.data;
  },

  confirmPayment: async (id) => {
    const response = await api.patch(
      `/admin/payments/${id}/confirm`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    return response.data;
  },
};
