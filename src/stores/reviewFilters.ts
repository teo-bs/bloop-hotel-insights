import { useSyncExternalStore } from "react";
import type { ReviewPlatform, Sentiment } from "@/stores/reviews";

export type DatePreset = "last_7" | "last_30" | "last_90" | "custom";

export interface ReviewFiltersState {
  datePreset: DatePreset;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  platforms: ReviewPlatform[]; // empty = all
  sentiment: "all" | Sentiment; // 'all' means no filter
  topics: string[]; // empty = all
  query: string; // free text search
}

const STORAGE_KEY = "padu.reviewFilters";

function defaultDates(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  const toStr = (d: Date) => d.toISOString().slice(0, 10);
  return { start: toStr(start), end: toStr(end) };
}

let state: ReviewFiltersState = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ReviewFiltersState;
  } catch {}
  const { start, end } = defaultDates();
  return {
    datePreset: "last_30",
    start,
    end,
    platforms: [],
    sentiment: "all",
    topics: [],
    query: "",
  } satisfies ReviewFiltersState;
})();

const listeners = new Set<() => void>();
function emit() { for (const l of listeners) l(); }

export function getReviewFilters() { return state; }
export function subscribeReviewFilters(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }
export function useReviewFilters() { return useSyncExternalStore(subscribeReviewFilters, getReviewFilters, getReviewFilters); }

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  emit();
}

export function setReviewFilters(next: Partial<ReviewFiltersState>) {
  state = { ...state, ...next };
  persist();
}

export function resetReviewFilters() {
  const { start, end } = defaultDates();
  state = { datePreset: "last_30", start, end, platforms: [], sentiment: "all", topics: [], query: "" };
  persist();
}
