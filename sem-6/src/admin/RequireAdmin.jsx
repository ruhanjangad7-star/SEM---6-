import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminLoggedIn } from "./data/adminAuthStore";

const RequireAdmin = ({ children }) => {
  const location = useLocation();

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAdmin;
