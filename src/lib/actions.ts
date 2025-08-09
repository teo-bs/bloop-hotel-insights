import Papa from "papaparse";
import { toast } from "sonner";
import {
  connectSourceAction,
  syncSourceAction,
  syncAllSourcesAction,
  type Platform,
} from "@/stores/reviewSources";

// Open the Integrations Modal via a global event
export function openIntegrationsModal() {
  window.dispatchEvent(new CustomEvent("open-integrations-modal"));
}

// Open the CSV Upload Modal via a global event
export function openCsvUploadModal() {
  window.dispatchEvent(new CustomEvent("open-csv-modal"));
}

// Alias to match wiring notes
export const openCsvModal = openCsvUploadModal;
// Placeholder: connect to a source (MVP logic lives in store actions)
export async function connectSource(platform: Platform, key: string) {
  try {
    await connectSourceAction(platform, key);
    toast.success(`${platform} connected`);
  } catch (e: any) {
    toast.error(e?.message || "Invalid key, try again");
    throw e;
  }
}

// Placeholder: sync a single source
export async function syncSource(platform: Platform) {
  toast.info(`Syncing ${platform}...`);
  await syncSourceAction(platform);
  toast.success(`${platform} synced`);
}

// Placeholder: sync all sources
export async function syncAllSources() {
  toast.info("Syncing all sources...");
  await syncAllSourcesAction();
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
  await new Promise((res) => setTimeout(res, 800));
  addReviews(normalized as any);
  return normalized.length;
}

export function emitReviewsUpdated() {
  window.dispatchEvent(new CustomEvent("reviews-updated"));
}

