import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNav from "@/components/layout/TopNav";
import UnifiedAuthForm from "@/components/auth/UnifiedAuthForm";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "signin" | "signup" | "reset";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const { user, loading } = useAuth();

  useEffect(() => {
    const path = location.pathname;
    const params = new URLSearchParams(location.search);
    const mParam = params.get("mode");
    if (path.endsWith("/sign-in")) setMode("signin");
    else if (path.endsWith("/sign-up")) setMode("signup");
    else if (path.endsWith("/reset")) setMode("reset");
    else if (mParam === "signup" || mParam === "signin" || mParam === "reset") setMode(mParam as AuthMode);
    else setMode("signin");
  }, [location.pathname, location.search]);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (!loading && user && location.pathname !== '/auth/callback') {
      const params = new URLSearchParams(location.search);
      const next = params.get('next');
      if (next && next.startsWith('/')) {
        navigate(next, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, location.pathname, location.search, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gpt5-gradient animate-gpt5-pan">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 md:p-10 bg-gpt5-gradient animate-gpt5-pan">
        <UnifiedAuthForm mode={mode} onModeChange={setMode} />
      </div>
    </>
  );
}
