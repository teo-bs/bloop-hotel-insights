import { ReactNode, useEffect, useState } from "react";
import { isAdmin } from "@/lib/admin";

interface AdminRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminRoute({ children, fallback }: AdminRouteProps) {
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

  if (!isAdminUser && fallback) {
    return <>{fallback}</>;
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}