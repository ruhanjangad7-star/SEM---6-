import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../../assets/index/orderStore";

const ORDER_STATUS_OPTIONS = [
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const formatPrice = (value) => `INR ${Number(value || 0).toFixed(2)}`;
const getAllowedStatusOptions = (currentStatus) => {
  const status = String(currentStatus || "").toLowerCase();
  if (status === "cancelled") return ["cancelled"];
  if (status === "delivered") return ["delivered"];
  if (status === "shipped") return ["shipped", "delivered"];
  return ["confirmed", "shipped", "delivered", "cancelled"];
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusByOrder, setStatusByOrder] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getOrders();
        setOrders(data);
        const statusMap = {};
        data.forEach((order) => {
          const current = String(order.status || "").toLowerCase();
          statusMap[order.id] = ORDER_STATUS_OPTIONS.includes(current) ? current : "confirmed";
        });
        setStatusByOrder(statusMap);
      } catch (err) {
        setError(err?.message || "Could not load orders.");
      }
    })();
  }, []);

  const onChangeStatus = (orderId, value) => {
    setStatusByOrder((prev) => ({ ...prev, [orderId]: value }));
  };

  const onSaveStatus = async (orderId) => {
    try {
      const nextStatus = String(statusByOrder[orderId] || "confirmed").toLowerCase();
      const updated = await updateOrderStatus(orderId, nextStatus);

      if (updated) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? { ...order, status: updated.status } : order))
        );
      }

      setError("");
      const orderLabel = orders.find((item) => item.id === orderId)?.orderCode || orderId;
      setSuccess(`Order #${orderLabel} status updated to ${nextStatus}.`);
      setTimeout(() => setSuccess(""), 1500);
    } catch (updateError) {
      setSuccess("");
      setError(updateError?.message || "Could not update order status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-red-700 to-red-500 p-6 text-white shadow">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <p className="mt-2 text-sm text-red-100">Track customer purchases, payment, and update delivery status.</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full min-w-[1080px]">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-gray-500" colSpan={8}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isCancelled = String(order.status || "").toLowerCase() === "cancelled";
                const isDelivered = String(order.status || "").toLowerCase() === "delivered";
                const options = getAllowedStatusOptions(order.status);
                const selectedStatus = statusByOrder[order.id] || options[0];
                const initials = String(order.fullName || "?")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() || "")
                  .join("");
                return (
                <tr className="border-t transition hover:bg-gray-50" key={order.id}>
                  <td className="px-4 py-3 font-semibold text-gray-900">#{order.orderCode || order.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-700">
                        {initials || "U"}
                      </div>
                      <span className="font-medium text-gray-900">{order.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{order.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {Array.isArray(order.items) ? order.items.length : 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 uppercase text-gray-700">{order.paymentMethod}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                      disabled={isCancelled || isDelivered}
                      value={selectedStatus}
                      onChange={(event) => onChangeStatus(order.id, event.target.value)}
                    >
                      {options.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                        isCancelled || isDelivered
                          ? "cursor-not-allowed bg-gray-400"
                          : "bg-red-700 hover:bg-red-600"
                      }`}
                      disabled={isCancelled || isDelivered}
                      onClick={() => onSaveStatus(order.id)}
                      type="button"
                    >
                      {isCancelled || isDelivered ? "Locked" : "Update"}
                    </button>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;


