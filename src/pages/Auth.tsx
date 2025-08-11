import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNav from "@/components/layout/TopNav";
import AuthForm, { AuthMode } from "@/components/auth/AuthForm";
import { resumePendingAfterAuth } from "@/lib/savePreview";

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

  async function handleSuccess() {
    try {
      const did = await resumePendingAfterAuth();
      if (!did) navigate("/dashboard", { replace: true });
    } catch {
      navigate("/dashboard", { replace: true });
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
