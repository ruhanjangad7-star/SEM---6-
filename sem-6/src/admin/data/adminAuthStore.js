const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
const ADMIN_SESSION_KEY = "admin_session_v1";

const safeParse = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getAdminSession = () => safeParse(localStorage.getItem(ADMIN_SESSION_KEY));
export const isAdminLoggedIn = () => Boolean(getAdminSession());

export const adminLogout = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const adminLogin = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Admin login failed");
  }

  if (data?.admin) {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(data.admin));
  }

  return data;
};
