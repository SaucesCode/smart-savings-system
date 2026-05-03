// src/components/ProtectedRoute.jsx
// Works as a layout route — wraps nested <Route> children.
// Redirects to /login if the user is not authenticated.

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Wait for Supabase to resolve the session before deciding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
        <div className="text-center space-y-3">
          <span className="text-4xl animate-bounce block">💰</span>
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Render nested routes (Dashboard, WalletPage, etc.)
  return <Outlet />;
}
