const CART_STORAGE_KEY = "shop_cart_v1";
const CART_BY_USER_KEY = "shop_cart_by_user_v1";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const safeParse = (raw) => {
  try {
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getCartItems = () => safeParse(localStorage.getItem(CART_STORAGE_KEY));

const saveCartItems = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  return items;
};

const getCartByUser = () => {
  try {
    const data = JSON.parse(localStorage.getItem(CART_BY_USER_KEY) || "{}");
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
};

const saveCartByUser = (map) => {
  localStorage.setItem(CART_BY_USER_KEY, JSON.stringify(map));
};

export const addToCart = (product, quantity = 1) => {
  const items = getCartItems();
  const id = String(product?.id ?? "");
  if (!id) return items;
  const availableQuantity = Math.max(0, Number(product?.quantity) || 0);

  const index = items.findIndex((item) => String(item.id) === id);
  const next = [...items];

  if (index >= 0) {
    const targetQuantity = Number(next[index].quantity || 1) + quantity;
    if (targetQuantity > availableQuantity) {
      throw new Error(`Only ${availableQuantity} item(s) available in stock.`);
    }
    next[index] = {
      ...next[index],
      quantity: targetQuantity,
      availableQuantity,
    };
  } else {
    if (quantity > availableQuantity) {
      throw new Error(`Only ${availableQuantity} item(s) available in stock.`);
    }
    next.push({
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price) || 0,
      discountPercentage: Number(product.discountPercentage) || 0,
      discountType: "Percentage",
      image: Array.isArray(product.imageUrls) ? product.imageUrls[0] || "" : "",
      quantity,
      availableQuantity,
    });
  }

  return saveCartItems(next);
};

export const updateCartItemQuantity = (productId, quantity, maxAvailable) => {
  const items = getCartItems();
  const nextQuantity = Number(quantity) || 0;

  if (nextQuantity <= 0) {
    return removeFromCart(productId);
  }

  const currentItem = items.find((item) => String(item.id) === String(productId));
  const availableQuantity =
    typeof maxAvailable === "number"
      ? maxAvailable
      : Math.max(0, Number(currentItem?.availableQuantity) || 0);

  if (availableQuantity > 0 && nextQuantity > availableQuantity) {
    throw new Error(`Only ${availableQuantity} item(s) available in stock.`);
  }

  const next = items.map((item) =>
    String(item.id) === String(productId)
      ? { ...item, quantity: nextQuantity, availableQuantity }
      : item
  );

  return saveCartItems(next);
};

export const removeFromCart = (productId) => {
  const items = getCartItems();
  const next = items.filter((item) => String(item.id) !== String(productId));
  return saveCartItems(next);
};

export const clearCart = () => saveCartItems([]);

export const snapshotCartForUser = (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return;
  const byUser = getCartByUser();
  byUser[normalizedEmail] = getCartItems();
  saveCartByUser(byUser);
};

export const restoreCartForUser = (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return clearCart();
  }

  const byUser = getCartByUser();
  const items = Array.isArray(byUser[normalizedEmail]) ? byUser[normalizedEmail] : [];
  return saveCartItems(items);
};

export const syncCartWithDatabaseProducts = async () => {
  const items = getCartItems();
  if (items.length === 0) {
    return items;
  }

  const response = await fetch(`${API_BASE_URL}/api/products?includeOutOfStock=true`);
  if (!response.ok) {
    return items;
  }

  const products = await response.json().catch(() => []);
  const productMap = new Map(
    (Array.isArray(products) ? products : []).map((product) => [String(product.id), product])
  );

  const synced = items
    .filter((item) => productMap.has(String(item.id)))
    .map((item) => {
      const product = productMap.get(String(item.id));
      const availableQuantity = Math.max(0, Number(product?.quantity) || 0);
      return {
        ...item,
        name: String(product?.name || item.name || ""),
        category: String(product?.category || item.category || ""),
        price: Number(product?.price) || 0,
        discountPercentage: Number(product?.discountPercentage) || 0,
        discountType: "Percentage",
        image: Array.isArray(product?.imageUrls) ? product.imageUrls[0] || "" : "",
        availableQuantity,
        quantity:
          availableQuantity > 0
            ? Math.max(1, Math.min(Number(item.quantity || 1), availableQuantity))
            : Math.max(1, Number(item.quantity || 1)),
      };
    });

  return saveCartItems(synced);
};
