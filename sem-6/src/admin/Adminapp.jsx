import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./Pages/Dashboard";
import Products from "./Pages/Products";
import AddProduct from "./Pages/AddProduct";
import Users from "./Pages/Users";
import Orders from "./Pages/Orders";
import ContactMessages from "./Pages/ContactMessages";

const AdminApp = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="orders" element={<Orders />} />
        <Route path="contact-messages" element={<ContactMessages />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
};

export default AdminApp;
