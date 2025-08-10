import { useSyncExternalStore } from "react";

export type Platform = "google" | "tripadvisor" | "booking";
export type SourceStatus = "not_connected" | "connecting" | "connected" | "error";

export interface SourceState {
  status: SourceStatus;
  keyMasked?: string | null;
  lastSyncAt?: string | null; // ISO string
}

export type ReviewSourcesState = Record<Platform, SourceState>;

const STORAGE_KEY = "padu.review_sources";

function getDefaultState(): ReviewSourcesState {
  return {
    google: { status: "not_connected", keyMasked: null, lastSyncAt: null },
    tripadvisor: { status: "not_connected", keyMasked: null, lastSyncAt: null },
    booking: { status: "not_connected", keyMasked: null, lastSyncAt: null },
  };
}

function loadState(): ReviewSourcesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("review_sources"); // migrate old key
    if (raw) return { ...getDefaultState(), ...(JSON.parse(raw) as ReviewSourcesState) };
  } catch {}
  return getDefaultState();
}

let state: ReviewSourcesState = loadState();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function setState(partial: Partial<ReviewSourcesState>) {
  state = { ...state, ...partial };
  persist();
  emit();
}

export function hydrateSources(partial: Partial<ReviewSourcesState>) {
  setState(partial);
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

// Actions with simulated delays; Supabase persistence handled in lib/actions
export async function connectSourceAction(platform: Platform, key: string) {
  // mark connecting immediately
  setState({ [platform]: { ...(state[platform] || { status: "not_connected" }), status: "connecting" } } as Partial<ReviewSourcesState>);
  await new Promise((res) => setTimeout(res, 600));
  if (key.trim().toLowerCase() === "error") {
    setState({ [platform]: { status: "error", keyMasked: null, lastSyncAt: state[platform]?.lastSyncAt ?? null } } as Partial<ReviewSourcesState>);
    throw new Error("Invalid key, try again");
  }
  const masked = `••••${key.slice(-4)}`;
  const now = new Date().toISOString();
  const newPlatformState: SourceState = { status: "connected", keyMasked: masked, lastSyncAt: now };
  setState({ [platform]: newPlatformState } as Partial<ReviewSourcesState>);
  return newPlatformState;
}

export async function disconnectSourceAction(platform: Platform) {
  setState({ [platform]: { status: "not_connected", keyMasked: null, lastSyncAt: null } } as Partial<ReviewSourcesState>);
}

export async function syncSourceAction(platform: Platform) {
  // simulate sync
  await new Promise((res) => setTimeout(res, 800));
  const now = new Date().toISOString();
  const prev = state[platform] ?? { status: "connected", keyMasked: null, lastSyncAt: null };
  setState({ [platform]: { ...prev, lastSyncAt: now } } as Partial<ReviewSourcesState>);
  return now;
}

export async function syncAllSourcesAction() {
  const platforms: Platform[] = ["google", "tripadvisor", "booking"];
  const connected = platforms.filter((p) => state[p]?.status === "connected");
  await Promise.all(connected.map((p) => syncSourceAction(p)));
}
