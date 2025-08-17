import { supabase } from "@/integrations/supabase/client";
import { getAuthRedirectUrl } from "@/lib/auth-config";

export async function isSignedIn() {
  const { data } = await supabase.auth.getSession();
  return !!data?.session;
}

export function openAuthModal(intent?: any, mode: 'signin' | 'signup' | 'reset' = 'signin') {
  try {
    localStorage.setItem("padu.pending", JSON.stringify(intent || null));
  } catch {}
  // Notify listeners to open the unified auth modal
  document.dispatchEvent(new CustomEvent("auth:open", { 
    detail: { 
      intent: intent || null,
      mode 
    } 
  }));
}

export function openSignupModal(intent?: any) {
  openAuthModal(intent, 'signup');
}

export function openSigninModal(intent?: any) {
  openAuthModal(intent, 'signin');
}
