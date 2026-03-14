import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { adminLogin, isAdminLoggedIn } from "../data/adminAuthStore";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate("/admin");
    }
  }, [navigate]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await adminLogin({ email: form.email.trim(), password: form.password });
      const target = location.state?.from || "/admin";
      navigate(target);
    } catch (loginError) {
      setError(loginError?.message || "Admin login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 via-white to-rose-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Admin Access</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Admin Login</h1>
        <p className="mt-2 text-sm text-gray-600">Sign in to manage products, orders, and users.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              name="email"
              placeholder="admin@nlapy.com"
              type="email"
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              name="password"
              placeholder="Enter admin password"
              type="password"
              value={form.password}
              onChange={onChange}
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            className="w-full rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing in..." : "Login as Admin"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Back to user area?{" "}
          <Link className="font-semibold text-red-700 hover:underline" to="/login">
            User Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
