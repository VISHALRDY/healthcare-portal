import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../auth";

export default function ProtectedRoute({ allowRoles, children }) {
  const token = getToken();
  const role = getRole();

  if (!token) return <Navigate to="/" replace />;

  if (allowRoles && !allowRoles.includes(role)) {
    // logged in but wrong role
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "doctor") return <Navigate to="/doctor" replace />;
    return <Navigate to="/patient" replace />;
  }

  return children;
}
