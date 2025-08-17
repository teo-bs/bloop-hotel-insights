import { supabase } from "@/integrations/supabase/client";

export type PendingSave = { type: "savePreview"; placeId?: string | null; url?: string | null };

export async function actuallySavePreview(pending: PendingSave) {
  const body = pending.placeId ? { placeId: pending.placeId } : { url: pending.url };
  const { data, error } = await supabase.functions.invoke("google-places-save-preview", { body });
  if (error) {
    // Try to surface details
    const details = (error as any)?.message || (error as any)?.error || "Save failed";
    throw new Error(details);
  }
  // Notify app and jump to reviews section
  window.dispatchEvent(new CustomEvent("events.reviewsUpdated"));
  try {
    window.location.href = "/reviews#reviews";
  } catch {}
  return data as any;
}

export async function onSavePreviewGuard(currentInputUrl: string, lastPreview: any) {
  const pid = lastPreview?.place?.id || lastPreview?.place?.place_id || null;
  const pending: PendingSave = { type: "savePreview", placeId: pid || null, url: pid ? null : currentInputUrl };

  const { isSignedIn, openAuthModal } = await import("./auth");
  if (!(await isSignedIn())) {
    try {
      localStorage.setItem("padu.pending", JSON.stringify(pending));
    } catch {}
    // Open auth modal in signup mode for save preview
    openAuthModal({ reason: "savePreview" }, "signup");
    return;
  }
  await actuallySavePreview(pending);
}

export async function resumePendingAfterAuth(): Promise<boolean> {
  const raw = localStorage.getItem("padu.pending");
  if (!raw) return false;
  let did = false;
  try {
    const pending = JSON.parse(raw);
    if (pending?.type === "savePreview") {
      await actuallySavePreview(pending);
      did = true;
    }
  } catch {}
  localStorage.removeItem("padu.pending");
  return did;
}
