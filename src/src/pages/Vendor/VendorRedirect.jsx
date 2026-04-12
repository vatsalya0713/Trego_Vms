// routes/VendorsRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function VendorsRedirect() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return <Navigate to="/vendors/admin/verify" replace />;
  }

  // SUPER_ADMIN (or others allowed)
  return <Navigate to="/vendors/list" replace />;
}
