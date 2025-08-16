import { supabase } from "@/integrations/supabase/client";
import { getAuthRedirectUrl } from "@/lib/auth-config";

export async function isSignedIn() {
  const { data } = await supabase.auth.getSession();
  return !!data?.session;
}

export function openAuthModal(intent?: any) {
  try {
    localStorage.setItem("padu.pending", JSON.stringify(intent || null));
  } catch {}
  // Notify listeners (if any) to open the unified auth modal
  document.dispatchEvent(new CustomEvent("auth:open", { detail: intent || null }));
}
