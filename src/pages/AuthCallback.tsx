import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resumePendingAfterAuth } from "@/lib/savePreview";
import { useToast } from "@/hooks/use-toast";
import { isAppSubdomain, redirectToApp, redirectToRoot } from "@/utils/domain";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Wait a bit for Supabase to process the URL hash
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Let Supabase handle the session from URL automatically
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast({ title: "Authentication failed", description: error.message, variant: "destructive" });
          // Redirect to root domain on error
          if (isAppSubdomain()) {
            redirectToRoot('/');
          } else {
            navigate("/", { replace: true });
          }
          return;
        }

        if (!session) {
          console.log("No session found, redirecting to home");
          // Redirect to root domain if no session
          if (isAppSubdomain()) {
            redirectToRoot('/');
          } else {
            navigate("/", { replace: true });
          }
          return;
        }

        // Clean up URL by removing the auth hash/query params
        if (window.location.hash || window.location.search.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
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
              // resumePendingAfterAuth will handle the redirect to reviews
              return;
            }
          } catch (e) {
            console.error("Error processing pending action:", e);
          }
          localStorage.removeItem("padu.pending");
        }

        // Default redirect to dashboard on app subdomain
        if (isAppSubdomain()) {
          navigate("/dashboard", { replace: true });
        } else {
          // If on root domain, redirect to app subdomain
          redirectToApp('/dashboard');
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast({ title: "Authentication error", description: "Please try signing in again.", variant: "destructive" });
        // Redirect to root domain on error
        if (isAppSubdomain()) {
          redirectToRoot('/');
        } else {
          navigate("/", { replace: true });
        }
      }
    }

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gpt5-gradient animate-gpt5-pan">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}