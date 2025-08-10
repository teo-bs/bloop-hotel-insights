import { supabase } from "@/integrations/supabase/client";

export async function isSignedIn() {
  const { data } = await supabase.auth.getSession();
  return !!data?.session;
}

export function openAuthModal(intent?: any) {
  try {
    localStorage.setItem("padu.pending-intent", JSON.stringify(intent || null));
  } catch {}
  // Notify listeners (if any) and navigate to auth with note
  document.dispatchEvent(new CustomEvent("auth:open", { detail: intent || null }));
  const params = new URLSearchParams();
  params.set("mode", "signin");
  params.set("note", "savePreview");
  if (intent?.reason) params.set("reason", String(intent.reason));
  // Redirect to auth page (acts as modal flow in this app)
  window.location.href = `/auth?${params.toString()}`;
}
