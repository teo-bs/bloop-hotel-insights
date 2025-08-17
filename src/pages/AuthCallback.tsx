import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resumePendingAfterAuth } from "@/lib/savePreview";
import { useToast } from "@/hooks/use-toast";
import { isAppSubdomain, redirectToApp, redirectToRoot } from "@/utils/domain";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Handle OAuth callback with retries for session detection
        const maxRetries = 3;
        let session = null;
        let error = null;

        // Give Supabase time to process OAuth callback and retry if needed
        for (let i = 0; i < maxRetries; i++) {
          await new Promise(resolve => setTimeout(resolve, i === 0 ? 100 : 500));
          const result = await supabase.auth.getSession();
          session = result.data.session;
          error = result.error;
          
          if (session || error) break;
          console.log(`Session retry ${i + 1}/${maxRetries}`);
        }
        
        if (error) {
          console.error("Auth callback error:", error);
          toast({ title: "Authentication failed", description: error.message, variant: "destructive" });
          navigate('/auth', { replace: true });
          return;
        }

        if (!session) {
          console.log("No session found after retries, redirecting to auth");
          navigate('/auth', { replace: true });
          return;
        }

        console.log("Session established successfully:", session.user.id);

        // Clean up URL by removing the auth hash/query params
        if (window.location.hash || window.location.search.includes('code=') || window.location.search.includes('access_token')) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        // Dispatch success event
        document.dispatchEvent(new CustomEvent("auth:success"));

        // Check for pending actions
        const raw = localStorage.getItem("padu.pending");
        if (raw) {
          try {
            const pending = JSON.parse(raw);
            if (pending?.type === "savePreview") {
              await resumePendingAfterAuth();
              localStorage.removeItem("padu.pending");
              return;
            }
          } catch (e) {
            console.error("Error processing pending action:", e);
          }
          localStorage.removeItem("padu.pending");
        }

        // Check for next parameter in URL
        const params = new URLSearchParams(location.search);
        const next = params.get('next');
        
        // Always redirect to dashboard on app subdomain
        if (next && next.startsWith('/')) {
          navigate(next, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast({ title: "Authentication error", description: "Please try signing in again.", variant: "destructive" });
        navigate('/auth', { replace: true });
      }
    }

    handleAuthCallback();
  }, [navigate, toast, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gpt5-gradient animate-gpt5-pan">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}