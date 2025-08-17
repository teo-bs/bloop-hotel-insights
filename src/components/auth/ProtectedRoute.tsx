
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check both user and session for better reliability
  if (!user || !session) {
    // Store next path and open auth modal instead of navigating
    const next = location.pathname + location.search;
    localStorage.setItem("padu.pending", JSON.stringify({ type: "redirect", path: next }));
    
    // Open auth modal with signup mode for protected routes
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent("auth:open", { 
        detail: { mode: "signup", intent: { type: "redirect", path: next } }
      }));
    }, 100);
    
    return (
      <div className="min-h-screen grid place-items-center bg-gpt5-gradient animate-gpt5-pan">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

