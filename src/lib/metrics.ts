import type { ReviewRow, Sentiment } from "@/stores/reviews";
import { startOfWeek } from "date-fns";

export type DateWindow = { from: string; to: string };

export type Filters = {
  platform?: Array<ReviewRow["platform"]>;
  sentiment?: Array<Sentiment>;
  topic?: string | string[];
};

export function getDateWindow(filter: "last_7" | "last_30" | "last_90"): DateWindow {
  const end = new Date();
  const days = filter === "last_7" ? 6 : filter === "last_30" ? 29 : 89;
  const start = new Date();
  start.setDate(end.getDate() - days);
  const toStr = (d: Date) => d.toISOString().slice(0, 10);
  return { from: toStr(start), to: toStr(end) };
}

export function filterReviews(reviews: ReviewRow[], window: DateWindow, filters: Filters = {}): ReviewRow[] {
  const { from, to } = window;
  const platforms = filters.platform && filters.platform.length ? new Set(filters.platform) : null;
  const sentiments = filters.sentiment && filters.sentiment.length ? new Set(filters.sentiment) : null;
  const topics = filters.topic
    ? new Set(Array.isArray(filters.topic) ? filters.topic.map((t) => t.toLowerCase()) : [filters.topic.toLowerCase()])
    : null;

  return reviews.filter((r) => {
    const d = r.date;
    if (d < from || d > to) return false;

    if (platforms && !platforms.has(r.platform)) return false;

    if (sentiments) {
      const s = (r as any).sentiment as Sentiment | undefined;
      const derived: Sentiment = s || (r.rating >= 4 ? "positive" : r.rating === 3 ? "neutral" : "negative");
      if (!sentiments.has(derived)) return false;
    }

    if (topics) {
      const ts = ((r as any).topics as string[] | undefined) || [];
      if (!ts.some((t) => topics.has(String(t).toLowerCase()))) return false;
    }

    return true;
  });
}

export function calcAvgRating(reviews: ReviewRow[]): number {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avg = sum / reviews.length;
  return Math.round(avg * 10) / 10;
}

export function calcTotals(reviews: ReviewRow[]): { total: number; positivePct: number } {
  const total = reviews.length;
  if (!total) return { total: 0, positivePct: 0 };
  let pos = 0;
  for (const r of reviews) {
    const s = (r as any).sentiment as Sentiment | undefined;
    const derived: Sentiment = s || (r.rating >= 4 ? "positive" : r.rating === 3 ? "neutral" : "negative");
    if (derived === "positive") pos += 1;
  }
  return { total, positivePct: (pos / total) * 100 };
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  cleanliness: ["clean", "dirty", "spotless", "hygiene"],
  staff: ["staff", "service", "team", "host"],
  breakfast: ["breakfast", "buffet"],
  wifi: ["wifi", "wi-fi", "internet"],
  room: ["room", "bed", "bathroom", "suite"],
  location: ["location", "walk", "near", "close", "area"],
  noise: ["noise", "noisy", "loud", "quiet"],
  "check-in": ["check-in", "check in", "checkin"],
};

function fallbackTopics(text: string): string[] {
  const t = (text || "").toLowerCase();
  const res: string[] = [];
  for (const [topic, kws] of Object.entries(TOPIC_KEYWORDS)) {
    if (kws.some((k) => t.includes(k))) res.push(topic);
  }
  return res.length ? res : ["general"];
}

export function calcTopTopic(reviews: ReviewRow[]): string {
  if (!reviews.length) return "—";
  const counts: Record<string, number> = {};
  for (const r of reviews) {
    const topics = ((r as any).topics as string[] | undefined)?.length
      ? ((r as any).topics as string[])
      : fallbackTopics(r.text);
    for (const t of topics) counts[t] = (counts[t] || 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return top || "—";
}

export function calcTrendSeries(reviews: ReviewRow[]): Array<{ weekStartISO: string; positive: number; neutral: number; negative: number }> {
  const byWeek: Record<string, { p: number; n: number; g: number }> = {};
  for (const r of reviews) {
    const d = new Date(r.date);
    if (isNaN(d.getTime())) continue;
    const ws = startOfWeek(d, { weekStartsOn: 1 }).toISOString().slice(0, 10);
    byWeek[ws] ||= { p: 0, n: 0, g: 0 };
    const s = (r as any).sentiment as Sentiment | undefined;
    const derived: Sentiment = s || (r.rating >= 4 ? "positive" : r.rating === 3 ? "neutral" : "negative");
    if (derived === "positive") byWeek[ws].p += 1;
    else if (derived === "neutral") byWeek[ws].n += 1;
    else byWeek[ws].g += 1;
  }
  return Object.entries(byWeek)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([weekStartISO, v]) => ({ weekStartISO, positive: v.p, neutral: v.n, negative: v.g }));
}

export function calcTopicCounts(reviews: ReviewRow[]): Array<{ topic: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const r of reviews) {
    const topics = ((r as any).topics as string[] | undefined)?.length
      ? ((r as any).topics as string[])
      : fallbackTopics(r.text);
    for (const t of topics) counts[t] = (counts[t] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}
