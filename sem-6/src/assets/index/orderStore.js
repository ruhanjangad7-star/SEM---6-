const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export const createOrder = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Failed to create order");
  }
  return data;
};

export const getOrders = async ({ email } = {}) => {
  const params = new URLSearchParams();
  if (email) {
    params.set("email", String(email).trim().toLowerCase());
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/orders${query ? `?${query}` : ""}`);
  const data = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch orders");
  }
  return Array.isArray(data) ? data : [];
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Failed to update order status");
  }

  return data?.order || null;
};
