import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNav from "@/components/layout/TopNav";
import AuthForm from "@/components/auth/AuthForm";

type AuthMode = "signin" | "signup" | "reset";
import { resumePendingAfterAuth } from "@/lib/savePreview";
import { supabase } from "@/integrations/supabase/client";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");

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

  useEffect(() => {
    // Redirect to dashboard if already signed in or upon sign-in
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { redirectToApp } = await import("@/utils/domain");
        redirectToApp('/dashboard');
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        const { redirectToApp } = await import("@/utils/domain");
        redirectToApp('/dashboard');
      }
    });
    return () => {
      sub.subscription?.unsubscribe();
    };
  }, [navigate]);

  async function handleSuccess() {
    try {
      const did = await resumePendingAfterAuth();
      if (!did) {
        const { redirectToApp } = await import("@/utils/domain");
        redirectToApp('/dashboard');
      }
    } catch {
      const { redirectToApp } = await import("@/utils/domain");
      redirectToApp('/dashboard');
    }
  }

  return (
    <>
      <TopNav />
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 md:p-10 bg-gpt5-gradient animate-gpt5-pan">
        <AuthForm mode={mode} onModeChange={setMode} onSuccess={handleSuccess} />
      </div>
    </>
  );
}
