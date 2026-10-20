import { Navigate } from "react-router-dom";

export function Protected({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function Guest({ token, children }) {
  if (token) return <Navigate to="/" replace />;
  return children;
}