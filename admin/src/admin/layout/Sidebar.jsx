import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-red-700 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-10">Admin Panel</h1>

      <nav className="space-y-4">
        <Link to="/admin" className="block hover:bg-red-600 p-2 rounded">Dashboard</Link>
        <Link to="/admin/products" className="block hover:bg-red-600 p-2 rounded">Products</Link>
        <Link to="/admin/categories" className="block hover:bg-red-600 p-2 rounded">Categories</Link>
        <Link to="/admin/users" className="block hover:bg-red-600 p-2 rounded">Users</Link>
      </nav>
    </div>
  );
};

export default Sidebar;