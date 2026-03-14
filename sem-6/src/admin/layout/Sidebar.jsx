import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 13h8V3H3v10Z" />
        <path d="M13 21h8v-6h-8v6Z" />
        <path d="M13 3h8v8h-8V3Z" />
        <path d="M3 21h8v-4H3v4Z" />
      </svg>
    ),
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7 12 3l9 4-9 4-9-4Z" />
        <path d="M3 7v10l9 4 9-4V7" />
      </svg>
    ),
  },
  {
    to: "/admin/products/add",
    label: "Add Product",
    icon: (
      <svg className="h-5 w-5 " viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h10" />
      </svg>
    ),
  },
  {
    to: "/admin/contact-messages",
    label: "Contact",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 5h18v14H3z" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6" />
        <path d="M23 11h-6" />
      </svg>
    ),
  },
];

const Sidebar = () => {
  return (
    <aside className="sticky top-0 flex min-h-screen w-72 flex-col bg-gradient-to-b from-red-800 via-red-700 to-red-600 p-6 text-white shadow-2xl">
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Panel</h1>
        <p className="mt-1 text-sm text-red-100">Store control center</p>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition",
                isActive
                  ? "bg-amber-100 text-red-700 shadow"
                  : "text-red-50 hover:bg-white/15 hover:text-white",
              ].join(" ")
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/20 bg-white/10 p-4 text-xs text-red-100">
        Manage products, orders, users, and inventory from one place.
      </div>
    </aside>
  );
};

export default Sidebar;
