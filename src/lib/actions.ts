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

// CSV Upload modal placeholder (not implemented yet)
export function openCsvUploadModal() {
  toast.info("CSV Upload modal (placeholder)");
}

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
