
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

const PublicRoute = () => {
  const { loading, isAuthenticated, user } = useAuth();

  // Wait for authentication check
  if (loading) {
    return <Loader />;
  }

  // Redirect already logged-in users
  if (isAuthenticated) {
    const dashboard =
      user.role === "admin"
        ? "/admin/dashboard"
        : "/student/dashboard";

    return <Navigate to={dashboard} replace />;
  }

  // Allow access to public pages
  return <Outlet />;
};

export default PublicRoute;
