import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "./authStore";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAuth;
