import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser } from "./authStore";

const linkClass = ({ isActive }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-red-700 text-white"
      : "text-red-700 hover:bg-red-100 hover:text-red-800",
  ].join(" ");

const cartIconClass = ({ isActive }) =>
  [
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border transition",
    isActive
      ? "border-red-700 bg-red-700 text-white"
      : "border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800",
  ].join(" ");

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getCurrentUser());
    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-rose-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-red-700">
          NEXAIRE
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/categories" className={linkClass}>
            Categories
          </NavLink>
          <NavLink to="/contact-us" className={linkClass}>
            Contact Us
          </NavLink>
          <NavLink to="/why-us" className={linkClass}>
            Why Us
          </NavLink>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <NavLink to="/cart" className={cartIconClass} aria-label="Cart" title="Cart">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
              <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H7" />
            </svg>
          </NavLink>
          {user ? (
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              onClick={() => navigate("/profile")}
              type="button"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Login
            </Link>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-700 md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          type="button"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {menuOpen ? (
        <div className="border-t border-rose-200 bg-white px-4 py-3 md:hidden">
          <div className="grid gap-2">
            <NavLink to="/" className={linkClass} end onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/categories" className={linkClass} onClick={() => setMenuOpen(false)}>
              Categories
            </NavLink>
            <NavLink to="/cart" className={linkClass} onClick={() => setMenuOpen(false)} aria-label="Cart">
              <span className="inline-flex items-center justify-center">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="17" cy="20" r="1" />
                  <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H7" />
                </svg>
              </span>
            </NavLink>
            <NavLink to="/contact-us" className={linkClass} onClick={() => setMenuOpen(false)}>
              Contact Us
            </NavLink>
            <NavLink to="/why-us" className={linkClass} onClick={() => setMenuOpen(false)}>
              Why Us
            </NavLink>

            {user ? (
              <button
                className="mt-1 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                type="button"
              >
                Profile
              </button>
            ) : (
              <Link
                to="/login"
                className="mt-1 rounded-lg bg-red-700 px-4 py-2 text-center text-sm font-semibold text-white"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
