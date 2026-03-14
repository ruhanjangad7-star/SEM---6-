const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export const getContactMessages = async () => {
  const response = await fetch(`${API_BASE_URL}/api/contact-messages`);
  const data = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch contact messages");
  }
  return Array.isArray(data) ? data : [];
};

export const updateContactMessageStatus = async (messageId, status) => {
  const response = await fetch(`${API_BASE_URL}/api/contact-messages/${messageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Failed to update message status");
  }
  return data?.contactMessage || null;
};

