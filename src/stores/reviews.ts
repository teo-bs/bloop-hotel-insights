import { useSyncExternalStore } from "react";

export type ReviewPlatform = "google" | "tripadvisor" | "booking";
export type Sentiment = "positive" | "neutral" | "negative";
export interface ReviewRow {
  id: string;
  date: string; // ISO date string
  platform: ReviewPlatform;
  rating: number; // 1..5
  text: string;
  title?: string;
  sentiment: Sentiment;
  topics: string[];
}

const LEGACY_KEY = "reviews_data";
const STORAGE_KEY = "padu.reviews";

function load(): ReviewRow[] {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return JSON.parse(existing) as ReviewRow[];
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
      return JSON.parse(legacy) as ReviewRow[];
    }
  } catch {}
  return [];
}

let reviews: ReviewRow[] = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function addReviews(rows: ReviewRow[]) {
  reviews = [...reviews, ...rows];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {}
  emit();
}

export function clearReviews() {
  reviews = [];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {}
  emit();
}

export function getReviews() {
  return reviews;
}

export function subscribeReviews(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useReviews() {
  return useSyncExternalStore(subscribeReviews, getReviews, getReviews);
}
