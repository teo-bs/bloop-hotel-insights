import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAdmin } from "@/lib/admin";
import ProtectedRoute from "./ProtectedRoute";

interface AdminDashboardRouteProps {
  children: ReactNode;
}

export default function AdminDashboardRoute({ children }: AdminDashboardRouteProps) {
  return (
    <ProtectedRoute>
      <AdminCheck>{children}</AdminCheck>
    </ProtectedRoute>
  );
}

function AdminCheck({ children }: { children: ReactNode }) {
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);

  useEffect(() => {
    isAdmin().then(setIsAdminUser);
  }, []);

  if (isAdminUser === null) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return <Navigate to="/waitlist-preview" replace />;
  }

  return <>{children}</>;
}