import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UnifiedAuthForm from "./UnifiedAuthForm";
import { resumePendingAfterAuth } from "@/lib/savePreview";
import { redirectToApp } from "@/utils/domain";

type AuthMode = "signin" | "signup" | "reset";

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");

  useEffect(() => {
    function handleOpen(e: any) {
      const detail = e.detail || {};
      setMode(detail.mode || "signup"); // Default to signup for new users
      setOpen(true);
    }
    function handleSuccess() {
      setOpen(false);
    }
    document.addEventListener("auth:open" as any, handleOpen as any);
    document.addEventListener("auth:success" as any, handleSuccess as any);
    return () => {
      document.removeEventListener("auth:open" as any, handleOpen as any);
      document.removeEventListener("auth:success" as any, handleSuccess as any);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl max-w-[440px] w-[90vw]">
        <div id="auth-modal" className="p-1">
          <UnifiedAuthForm
            mode={mode}
            onModeChange={setMode}
            onSuccess={async () => {
              setOpen(false);
              // Handle post-auth routing
              try {
                const pending = localStorage.getItem("padu.pending");
                if (pending) {
                  const intent = JSON.parse(pending);
                  if (intent?.type === "savePreview") {
                    await resumePendingAfterAuth();
                    return;
                  }
                }
                // Check for next parameter
                const params = new URLSearchParams(window.location.search);
                const next = params.get('next');
                if (next && next.startsWith('/')) {
                  redirectToApp(next);
                } else {
                  redirectToApp('/dashboard');
                }
              } catch {
                redirectToApp('/dashboard');
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}