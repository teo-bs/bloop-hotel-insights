import { useSyncExternalStore } from "react";

export interface DateRange {
  start: string; // ISO date (YYYY-MM-DD)
  end: string;   // ISO date (YYYY-MM-DD)
}

const STORAGE_KEY = "global_date_filter";

function defaultRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 89);
  const toStr = (d: Date) => d.toISOString().slice(0, 10);
  return { start: toStr(start), end: toStr(end) };
}

let range: DateRange = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DateRange;
  } catch {}
  return defaultRange();
})();

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getGlobalDateFilter() {
  return range;
}

export function subscribeGlobalDateFilter(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGlobalDateFilter() {
  return useSyncExternalStore(subscribeGlobalDateFilter, getGlobalDateFilter, getGlobalDateFilter);
}

export function setGlobalDateFilter(next: DateRange) {
  range = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(range));
  } catch {}
  emit();
}
