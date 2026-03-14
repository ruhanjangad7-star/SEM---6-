const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export const getAdminAlerts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin-alerts`);
  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch admin alerts");
  }

  return Array.isArray(data) ? data : [];
};
