import { clearCart, restoreCartForUser, snapshotCartForUser } from "./cartStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
const AUTH_USER_KEY = "auth_user_v1";

const safeParse = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getCurrentUser = () => safeParse(localStorage.getItem(AUTH_USER_KEY));
export const isLoggedIn = () => Boolean(getCurrentUser());

export const logout = () => {
  const user = getCurrentUser();
  if (user?.email) {
    snapshotCartForUser(user.email);
  }
  clearCart();
  localStorage.removeItem(AUTH_USER_KEY);
};

const request = async (path, payload) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data;
};

export const signup = async ({ name, email, password }) => {
  return request("/api/auth/signup", { name, email, password });
};

export const login = async ({ email, password }) => {
  const data = await request("/api/auth/login", { email, password });
  if (data?.user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    restoreCartForUser(data.user.email);
  }
  return data;
};

export const updateProfile = async ({ id, name, email, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Failed to update profile");
  }

  if (data?.user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }

  return data;
};

export const getUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users`);
  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch users");
  }

  return Array.isArray(data) ? data : [];
};
