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
  // Convert rows to normalized ReviewRow and persist
  const normalized = rows.map((r) => ({
    date: String(r.date).trim(),
    platform: String(r.platform).toLowerCase().trim() as any,
    rating: Number(r.rating),
    text: String(r.text).trim(),
    title: r.title ? String(r.title) : undefined,
  }));
  const { addReviews } = await import("@/stores/reviews");
  await new Promise((res) => setTimeout(res, 800));
  addReviews(normalized as any);
  return normalized.length;
}

export function emitReviewsUpdated() {
  window.dispatchEvent(new CustomEvent("reviews-updated"));
}

