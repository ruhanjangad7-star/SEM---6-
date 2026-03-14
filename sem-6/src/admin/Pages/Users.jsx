import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../../assets/index/authStore";
import { getOrders } from "../../assets/index/orderStore";

const formatPrice = (value) => `INR ${Number(value || 0).toFixed(2)}`;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [list, allOrders] = await Promise.all([getUsers(), getOrders()]);
        setUsers(list);
        setOrders(allOrders);
      } catch (err) {
        setError(err?.message || "Could not load users.");
      }
    })();
  }, []);

  const statsByEmail = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      const email = String(order.email || "").trim().toLowerCase();
      if (!email) return;
      if (!map[email]) {
        map[email] = { orders: 0, spend: 0, lastOrderAt: null };
      }
      map[email].orders += 1;
      map[email].spend += Number(order.total || 0);
      if (order.createdAt) {
        const current = new Date(order.createdAt).getTime();
        const previous = map[email].lastOrderAt ? new Date(map[email].lastOrderAt).getTime() : 0;
        if (current > previous) {
          map[email].lastOrderAt = order.createdAt;
        }
      }
    });
    return map;
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-red-700 to-red-500 p-6 text-white shadow">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <p className="mt-2 text-sm text-red-100">
          View registered users with their order count, spend, and latest activity.
        </p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full min-w-[920px]">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total Spent</th>
              <th className="px-4 py-3">Last Order</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-gray-500" colSpan={7}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const emailKey = String(user.email || "").trim().toLowerCase();
                const stats = statsByEmail[emailKey] || { orders: 0, spend: 0, lastOrderAt: null };
                const initials = String(user.name || "?")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() || "")
                  .join("");

                return (
                <tr className="border-t transition hover:bg-gray-50" key={user.id}>
                  <td className="px-4 py-3 font-semibold text-gray-900">#{user.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-700">
                        {initials || "U"}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {stats.orders}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(stats.spend)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {stats.lastOrderAt ? new Date(stats.lastOrderAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        stats.orders > 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {stats.orders > 0 ? "Buyer" : "New"}
                    </span>
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

export default Users;
