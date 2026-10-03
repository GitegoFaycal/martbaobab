import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLoadingScreen from "./AuthLoadingScreen";

function getUserDestination(user) {
  if (user?.role === "ADMIN") {
    return "/admin";
  }

  if (user?.role === "SELLER") {
    return "/seller";
  }

  return "/profile";
}

export default function PublicOnlyRoute() {
  const { user, isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={getUserDestination(user)} replace />;
  }

  return <Outlet />;
}