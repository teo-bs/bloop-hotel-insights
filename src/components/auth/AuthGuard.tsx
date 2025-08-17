import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * AuthGuard handles /auth route:
 * - If authenticated: redirect to dashboard
 * - If not authenticated: open auth modal and keep user on current page
 */
export default function AuthGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // User is authenticated, redirect to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // User is not authenticated, open auth modal and navigate back
      const params = new URLSearchParams(location.search);
      const next = params.get('next');
      const mode = params.get('mode') || 'signin';
      
      // Store pending action if next parameter exists
      if (next) {
        localStorage.setItem("padu.pending", JSON.stringify({ type: "redirect", path: next }));
      }
      
      // Open auth modal
      document.dispatchEvent(new CustomEvent("auth:open", { 
        detail: { 
          mode: mode === 'signup' ? 'signup' : 'signin',
          intent: next ? { type: "redirect", path: next } : null
        }
      }));
      
      // Navigate back to previous page or dashboard
      navigate(next && next.startsWith('/') ? next : '/dashboard', { replace: true });
    }
  }, [user, loading, navigate, location]);

  // Show loading while determining auth state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gpt5-gradient animate-gpt5-pan">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}