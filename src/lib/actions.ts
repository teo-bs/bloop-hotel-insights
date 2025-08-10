import Papa from "papaparse";
import { toast } from "sonner";
import {
  connectSourceAction,
  disconnectSourceAction,
  syncSourceAction,
  syncAllSourcesAction,
  getReviewSourcesState,
  hydrateSources,
  type Platform,
} from "@/stores/reviewSources";
import { supabase } from "@/integrations/supabase/client";

// Open the Integrations Modal via a global event
export function openIntegrationsModal() {
  window.dispatchEvent(new CustomEvent("open-integrations-modal"));
}

// Open Integrations with optional hint (e.g., Google placeId)
export function openIntegrationsModalWithHint(hint?: { platform?: string; placeId?: string }) {
  window.dispatchEvent(new CustomEvent("open-integrations-modal", { detail: hint || {} } as any));
}

// Open the CSV Upload Modal via a global event
export function openCsvUploadModal() {
  window.dispatchEvent(new CustomEvent("open-csv-modal"));
}

// Alias to match wiring notes
export const openCsvModal = openCsvUploadModal;

async function getUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function hydrateReviewSourcesFromSupabase() {
  const uid = await getUserId();
  if (!uid) return; // unauthenticated: rely on local storage state
  const { data, error } = await supabase
    .from("review_sources")
    .select("platform,status,key_masked,last_sync_at")
    .eq("user_id", uid);
  if (error) {
    console.warn("[hydrateReviewSourcesFromSupabase]", error);
    return;
  }
  const partial: Partial<Record<Platform, any>> = {};
  for (const row of data || []) {
    const platform = row.platform as Platform;
    partial[platform] = {
      status: row.status,
      keyMasked: row.key_masked ?? null,
      lastSyncAt: row.last_sync_at ? new Date(row.last_sync_at as string).toISOString() : null,
    };
  }
  hydrateSources(partial as any);
}

// Connect to a source and persist
export async function connectSource(platform: Platform, key: string) {
  try {
    const newState = await connectSourceAction(platform, key);
    const uid = await getUserId();
    if (uid) {
      const { error } = await supabase.from("review_sources").upsert({
        user_id: uid,
        platform,
        status: newState.status,
        key_masked: newState.keyMasked ?? null,
        last_sync_at: newState.lastSyncAt ?? null,
      });
      if (error) console.warn("[connectSource] upsert error", error);
    }
    toast.success(`${platform} connected`);
  } catch (e: any) {
    toast.error(e?.message || "Invalid key, try again");
    throw e;
  }
}

export async function disconnectSource(platform: Platform) {
  await disconnectSourceAction(platform);
  const uid = await getUserId();
  if (uid) {
    const { error } = await supabase
      .from("review_sources")
      .delete()
      .eq("user_id", uid)
      .eq("platform", platform);
    if (error) console.warn("[disconnectSource] delete error", error);
  }
  toast.message(`${platform} disconnected`);
}

// Sync a single source
export async function syncSource(platform: Platform) {
  toast.info(`Syncing ${platform}...`);
  const nowIso = await syncSourceAction(platform);
  const uid = await getUserId();
  if (uid) {
    const { error } = await supabase
      .from("review_sources")
      .update({ last_sync_at: nowIso })
      .eq("user_id", uid)
      .eq("platform", platform);
    if (error) console.warn("[syncSource] update error", error);
  }
  toast.success(`${platform} synced`);
}

// Sync all connected sources
export async function syncAllSources() {
  toast.info("Syncing all sources...");
  await syncAllSourcesAction();
  const uid = await getUserId();
  if (uid) {
    const s = getReviewSourcesState();
    const entries = (Object.entries(s) as [Platform, any][]).filter(([, v]) => v.status === "connected");
    if (entries.length) {
      const rows = entries.map(([platform, v]) => ({
        user_id: uid,
        platform,
        last_sync_at: v.lastSyncAt ?? null,
        status: v.status,
        key_masked: v.keyMasked ?? null,
      }));
      const { error } = await supabase.from("review_sources").upsert(rows);
      if (error) console.warn("[syncAllSources] upsert error", error);
    }
  }
  toast.success("All sources synced");
}

export type ParsedCsvRow = {
  date: string;
  platform: string;
  rating: string | number;
  text: string;
  title?: string;
};

export async function parseCsv(file: File): Promise<{ rows: ParsedCsvRow[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<ParsedCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const headers = res.meta.fields || [];
        resolve({ rows: (res.data as any) || [], headers });
      },
      error: (err) => reject(err),
    });
  });
}

export async function importReviews(rows: ParsedCsvRow[]): Promise<number> {
  // Normalize, enrich with id, sentiment, topics, and persist
  const toIsoDay = (s: string) => {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    // fallback for mm/dd/yyyy (validated earlier)
    const m = s.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/);
    if (m) {
      const mm = Number(m[1]);
      const dd = Number(m[2]);
      const yyyy = Number(m[3]);
      const d2 = new Date(yyyy, mm - 1, dd);
      return d2.toISOString().slice(0, 10);
    }
    return s;
  };

  const keywords: Record<string, string[]> = {
    cleanliness: ["clean", "dirty", "spotless", "hygiene"],
    staff: ["staff", "service", "team", "host"],
    breakfast: ["breakfast", "buffet"],
    wifi: ["wifi", "wi-fi", "internet"],
    room: ["room", "bed", "bathroom", "suite"],
    location: ["location", "walk", "near", "close", "area"],
    noise: ["noise", "noisy", "loud", "quiet"],
    "check-in": ["check-in", "check in", "checkin"],
  };

  const normalized = rows.map((r) => {
    const rating = Number(r.rating);
    const sentiment = rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";
    const text = String(r.text || "");
    const t = text.toLowerCase();
    const topics: string[] = [];
    for (const [topic, kws] of Object.entries(keywords)) {
      if (kws.some((k) => t.includes(k))) topics.push(topic);
    }
    const id = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    return {
      id,
      date: toIsoDay(String(r.date).trim()),
      platform: String(r.platform).toLowerCase().trim() as any,
      rating,
      text: text.trim(),
      title: r.title ? String(r.title) : undefined,
      sentiment,
      topics,
    };
  });

  const { addReviews } = await import("@/stores/reviews");
  // Best-effort persistence to Supabase if authenticated
  try {
    const uid = await getUserId();
    if (uid) {
      const toInsert = normalized.map((n) => ({
        user_id: uid,
        date: n.date,
        platform: n.platform,
        rating: n.rating,
        title: n.title ?? null,
        text: n.text,
        sentiment: n.sentiment,
        topics: n.topics,
      }));
      const { error } = await (supabase as any).from("reviews").insert(toInsert);
      if (error) console.warn("[importReviews] supabase insert error", error);
    }
  } catch (err) {
    console.warn("[importReviews] supabase insert failed", err);
  }
  await new Promise((res) => setTimeout(res, 800));
  addReviews(normalized as any);
  return normalized.length;
}

export function emitReviewsUpdated() {
  window.dispatchEvent(new CustomEvent("reviews-updated"));
}
