import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../lib/auth";

export function ProtectedRoute() {
  const { auth } = useAuth();

  if (!auth) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}
