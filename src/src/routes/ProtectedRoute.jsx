import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login/vendor" replace />; 
  }

  const userRole = user.role?.toUpperCase();
  const allowedRoles = roles?.map(r => r.toUpperCase());

  if (allowedRoles?.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
