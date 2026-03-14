import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../component/StatCard";
import { getAdminAlerts } from "../data/adminAlertStore";
import { getProducts } from "../data/productStore";
import { getContactMessages } from "../data/contactStore";
import { getUsers } from "../../assets/index/authStore";
import { getOrders } from "../../assets/index/orderStore";

const formatPrice = (value) => `INR ${Number(value || 0).toFixed(2)}`;

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [allProducts, allUsers, allOrders, allAlerts, allContactMessages] = await Promise.all([
          getProducts({ includeOutOfStock: true }),
          getUsers(),
          getOrders(),
          getAdminAlerts(),
          getContactMessages(),
        ]);
        setProducts(allProducts);
        setUsers(allUsers);
        setOrders(allOrders);
        setAlerts(allAlerts);
        setContactMessages(allContactMessages);
      } catch (err) {
        setError(err?.message || "Could not load dashboard data.");
      }
    })();
  }, []);

  const outOfStockCount = useMemo(
    () => products.filter((product) => Number(product.quantity || 0) <= 0).length,
    [products]
  );

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-red-700 to-red-500 p-6 text-white shadow">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-red-100">Live overview of products, users, orders, and stock status.</p>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[1020px] grid-cols-6 gap-4">
          <StatCard title="Total Products" value={products.length} to="/admin/products" />
          <StatCard title="Users" value={users.length} to="/admin/users" />
          <StatCard title="Orders" value={orders.length} to="/admin/orders" />
          <StatCard title="Contact Messages" value={contactMessages.length} to="/admin/contact-messages" />
          <StatCard title="Stock Alerts" value={alerts.length} />
          <StatCard title="Out of Stock" value={outOfStockCount} to="/admin/products" />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-900">Business Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-gray-900">{formatPrice(totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-gray-600">Average Order Value</span>
              <span className="font-semibold text-gray-900">
                {orders.length ? formatPrice(totalRevenue / orders.length) : formatPrice(0)}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div className="rounded-lg border border-gray-100 px-4 py-3" key={order.id}>
                  <p className="text-sm font-semibold text-gray-900">
                    #{order.orderCode || order.id} - {order.fullName}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {Array.isArray(order.items) ? order.items.length : 0} item(s) | {formatPrice(order.total)} |{" "}
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Contact Messages</h2>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              {contactMessages.length}
            </span>
          </div>

          {contactMessages.length === 0 ? (
            <p className="text-sm text-gray-600">No contact messages yet.</p>
          ) : (
            <div className="space-y-3">
              {contactMessages.slice(0, 5).map((message) => (
                <div className="rounded-xl border border-gray-100 px-4 py-3" key={message.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">
                      #{message.id} - {message.name}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                        String(message.status || "").toLowerCase() === "resolved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {message.status || "new"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-gray-700">{message.subject}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {message.createdAt ? new Date(message.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Inventory Alerts</h2>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              {alerts.length} alert{alerts.length === 1 ? "" : "s"}
            </span>
          </div>

          {alerts.length === 0 ? (
            <p className="text-sm text-gray-600">No inventory alerts yet.</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                  key={alert.id}
                >
                  <p className="font-semibold">{alert.message}</p>
                  <p className="mt-1 text-xs text-red-600">
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

