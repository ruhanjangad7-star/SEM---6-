const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export const normalizeCategory = (value = "") => value.trim().toLowerCase();

const normalizeProduct = (product = {}) => ({
  id: product.id,
  name: String(product.name || ""),
  description: String(product.description || ""),
  category: String(product.category || ""),
  categoryKey: product.categoryKey || normalizeCategory(product.category || ""),
  price: Number(product.price) || 0,
  discountPercentage: Number(product.discountPercentage) || 0,
  discountType: "Percentage",
  quantity: Number(product.quantity) || 0,
  position: Number(product.position) || 0,
  imageUrls: Array.isArray(product.imageUrls) ? product.imageUrls : [],
  createdAt: product.createdAt || null,
});

export const getProducts = async ({ includeOutOfStock = false } = {}) => {
  const params = new URLSearchParams();
  if (includeOutOfStock) {
    params.set("includeOutOfStock", "true");
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/products${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw new Error("Failed to fetch products from backend");
  }

  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeProduct) : [];
};

export const addProduct = async (input) => {
  const payload = {
    name: String(input.name || "").trim(),
    description: String(input.description || "").trim(),
    category: String(input.category || "").trim(),
    price: Number(input.price) || 0,
    discountPercentage: Number(input.discountPercentage) || 0,
    discountType: "Percentage",
    quantity: Number(input.quantity) || 0,
    position: Math.max(0, Number(input.position) || 0),
    imageUrls: Array.isArray(input.imageUrls) ? input.imageUrls : [],
  };

  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to add product";
    try {
      const err = await response.json();
      if (err && err.error) {
        message = err.error;
      }
    } catch {
      // Keep default error message when JSON parsing fails.
    }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeProduct) : [];
};

export const updateProduct = async (productId, input) => {
  const payload = {
    name: String(input.name || "").trim(),
    description: String(input.description || "").trim(),
    category: String(input.category || "").trim(),
    price: Number(input.price) || 0,
    discountPercentage: Number(input.discountPercentage) || 0,
    discountType: "Percentage",
    quantity: Number(input.quantity) || 0,
    position: Math.max(0, Number(input.position) || 0),
  };

  if (Array.isArray(input.imageUrls)) {
    payload.imageUrls = input.imageUrls;
  }

  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Failed to update product");
  }

  return normalizeProduct(data?.product || {});
};

export const deleteProduct = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Failed to delete product");
  }

  return true;
};
