import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./footer";
import { getCurrentUser, logout, updateProfile } from "./authStore";
import { getOrders, updateOrderStatus } from "./orderStore";

const formatPrice = (value) => `INR ${Number(value || 0).toFixed(2)}`;

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    setForm({
      name: current?.name || "",
      email: current?.email || "",
      password: "",
    });

    (async () => {
      if (!current?.email) {
        setOrders([]);
        setLoadingOrders(false);
        return;
      }
      try {
        const list = await getOrders({ email: current.email });
        setOrders(list);
      } catch (orderError) {
        setError(orderError?.message || "Could not load your orders.");
      } finally {
        setLoadingOrders(false);
      }
    })();
  }, []);

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSaveProfile = async (event) => {
    event.preventDefault();
    if (!user?.id) {
      setError("User session not found. Please login again.");
      return;
    }

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      const response = await updateProfile({
        id: user.id,
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setUser(response.user);
      setForm((prev) => ({ ...prev, password: "" }));
      setError("");
      setSuccess("Profile updated successfully.");
    } catch (updateError) {
      setSuccess("");
      setError(updateError?.message || "Could not update profile.");
    }
  };

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  const onCancelOrder = async (order) => {
    const currentStatus = String(order?.status || "").toLowerCase();
    if (currentStatus === "cancelled" || currentStatus === "shipped" || currentStatus === "delivered") {
      return;
    }

    try {
      setCancellingOrderId(order.id);
      const updated = await updateOrderStatus(order.id, "cancelled");
      if (updated) {
        setOrders((prev) =>
          prev.map((item) => (item.id === order.id ? { ...item, status: updated.status } : item))
        );
      }
      setError("");
      setSuccess(`Order #${order.orderCode || order.id} cancelled.`);
    } catch (cancelError) {
      setSuccess("");
      setError(cancelError?.message || "Could not cancel order.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-gray-50">
      <div className="border-b border-rose-100 bg-white/95">
        <Navbar />
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="rounded-2xl bg-gradient-to-r from-red-700 to-red-500 p-6 text-white shadow">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-sm text-red-100">Manage your account details and track your orders.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
            <form className="mt-4 space-y-4" onSubmit={onSaveProfile}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">New Password (optional)</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  name="password"
                  placeholder="Leave blank to keep current password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                  type="submit"
                >
                  Save Changes
                </button>
                <button
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
                  onClick={onLogout}
                  type="button"
                >
                  Logout
                </button>
              </div>
            </form>
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Account Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-semibold text-gray-900">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-semibold text-gray-900">{formatPrice(totalSpent)}</span>
              </div>
            </div>
          </aside>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">My Orders</h2>

          {loadingOrders ? (
            <p className="mt-4 text-sm text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">You have not placed any orders yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 text-left text-sm text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const status = String(order.status || "").toLowerCase();
                    const canCancel =
                      status !== "cancelled" && status !== "shipped" && status !== "delivered";
                    return (
                    <tr className="border-t border-gray-100" key={order.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">#{order.orderCode || order.id}</td>
                      <td className="px-4 py-3 text-gray-700">{Array.isArray(order.items) ? order.items.length : 0}</td>
                      <td className="px-4 py-3 uppercase text-gray-700">{order.paymentMethod}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase text-amber-700">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {canCancel ? (
                          <button
                            className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                            disabled={cancellingOrderId === order.id}
                            onClick={() => onCancelOrder(order)}
                            type="button"
                          >
                            {cancellingOrderId === order.id ? "Cancelling..." : "Cancel"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;

