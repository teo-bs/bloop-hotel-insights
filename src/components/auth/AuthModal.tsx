import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthForm, { AuthMode } from "./AuthForm";
import { resumePendingAfterAuth } from "@/lib/savePreview";
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
      <DialogContent className="p-0 bg-transparent border-0 shadow-none">
        <div id="auth-modal" className="max-w-[440px] w-[88vw] mx-auto">
          <AuthForm
            mode={mode}
            onModeChange={setMode}
            compactHeader
            onSuccess={async () => {
              setOpen(false);
              try {
                const did = await resumePendingAfterAuth();
                if (!did) window.location.href = "/dashboard";
              } catch {
                window.location.href = "/dashboard";
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
