import { useSyncExternalStore } from "react";

export type Platform = "google" | "tripadvisor" | "booking";
export type SourceStatus = "not_connected" | "connected" | "error";

export interface SourceState {
  status: SourceStatus;
  lastSyncAt: string | null; // ISO string
}

export type ReviewSourcesState = Record<Platform, SourceState>;

const STORAGE_KEY = "review_sources";

function loadState(): ReviewSourcesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ReviewSourcesState;
  } catch {}
  return {
    google: { status: "not_connected", lastSyncAt: null },
    tripadvisor: { status: "not_connected", lastSyncAt: null },
    booking: { status: "not_connected", lastSyncAt: null },
  };
}

let state: ReviewSourcesState = loadState();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setState(partial: Partial<ReviewSourcesState>) {
  state = { ...state, ...partial };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
  emit();
}

export function getReviewSourcesState() {
  return state;
}

export function subscribeReviewSources(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useReviewSources() {
  return useSyncExternalStore(subscribeReviewSources, getReviewSourcesState, getReviewSourcesState);
}

// Actions (MVP stubs with simple delays)
export async function connectSourceAction(platform: Platform, key: string) {
  // simulate processing
  await new Promise((res) => setTimeout(res, 600));
  if (key.trim().toLowerCase() === "error") {
    // do not update store, signal error to caller
    throw new Error("Invalid key, try again");
  }
  const now = new Date().toISOString();
  setState({
    [platform]: { status: "connected", lastSyncAt: now },
  } as Partial<ReviewSourcesState>);
}

export async function syncSourceAction(platform: Platform) {
  // simulate short sync
  await new Promise((res) => setTimeout(res, 700));
  const now = new Date().toISOString();
  setState({
    [platform]: { ...(state[platform] ?? { status: "connected", lastSyncAt: null }), lastSyncAt: now },
  } as Partial<ReviewSourcesState>);
}

export async function syncAllSourcesAction() {
  const platforms: Platform[] = ["google", "tripadvisor", "booking"];
  await Promise.all(platforms.map((p) => syncSourceAction(p)));
}
