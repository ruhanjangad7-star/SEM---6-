import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminLogout } from "../data/adminAuthStore";

const getPageTitle = (pathname) => {
  if (pathname.startsWith("/admin/products/add")) return "Add Product";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/contact-messages")) return "Contact Messages";
  if (pathname.startsWith("/admin/users")) return "Users";
  return "Dashboard";
};

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = getPageTitle(location.pathname);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin-login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Admin</p>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
          onClick={handleLogout}
          type="button"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
