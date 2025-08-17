
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    const next = location.pathname + location.search;
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />;
  }

  return <>{children}</>;
}

