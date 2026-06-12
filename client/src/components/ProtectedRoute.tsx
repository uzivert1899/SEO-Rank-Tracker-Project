import { Outlet, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Loader from "./Loader";

export default function ProtectedRoute() {
  const { user, loading } = useApp();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
