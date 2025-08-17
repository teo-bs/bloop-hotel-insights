import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UnifiedAuthForm from "./UnifiedAuthForm";
import { resumePendingAfterAuth } from "@/lib/savePreview";

type AuthMode = "signin" | "signup" | "reset";

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");

  useEffect(() => {
    function handleOpen(e: any) {
      setMode("signin");
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
      <DialogContent className="p-0 bg-white/15 backdrop-blur-md border-0 shadow-none modal-overlay">
        <div id="auth-modal" className="max-w-[440px] w-[88vw] mx-auto">
          <UnifiedAuthForm
            mode={mode}
            onModeChange={setMode}
            onSuccess={async () => {
              setOpen(false);
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
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}