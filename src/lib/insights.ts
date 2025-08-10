import type { ReviewRow, Sentiment } from "@/stores/reviews";

export type InsightImpact = "High" | "Medium" | "Low";

export interface Insight {
  id: string;
  title: string;
  recommendation: string;
  impact: InsightImpact;
  evidence: {
    mentions: number;
    recentExamples: string[];
  };
}

function toDay(dateISO: string): string {
  return dateISO?.slice(0, 10) || "";
}

function isNegative(r: ReviewRow): boolean {
  const s = (r as any).sentiment as Sentiment | undefined;
  const derived: Sentiment = s || (r.rating >= 4 ? "positive" : r.rating === 3 ? "neutral" : "negative");
  return derived === "negative";
}

function pickRecentExamples(rows: ReviewRow[], count = 2): string[] {
  const sorted = [...rows].sort((a, b) => toDay(b.date).localeCompare(toDay(a.date)));
  const examples: string[] = [];
  for (const r of sorted.slice(0, count)) {
    const src = (r.text || r.title || "").trim();
    const snippet = src.length > 120 ? `${src.slice(0, 117)}...` : src;
    examples.push(snippet);
  }
  return examples;
}

function mentionsAny(text: string, kws: string[]): boolean {
  const t = text.toLowerCase();
  return kws.some((k) => t.includes(k));
}

export function generateInsights(reviews: ReviewRow[]): Insight[] {
  const res: Insight[] = [];
  const byRule: Array<{
    id: string;
    title: string;
    recommendation: string;
    impact: InsightImpact;
    keywords: string[];
    minMentions: number;
    minNegativePct?: number; // 0..100
    requireMixed?: boolean; // pos and neg present
  }> = [
    {
      id: "checkin",
      title: "Improve check-in speed",
      recommendation: "Add express check-in and enable mobile keys to reduce lobby waits.",
      impact: "High",
      keywords: ["check-in", "check in", "checkin", "reception", "front desk"],
      minMentions: 5,
      minNegativePct: 40,
    },
    {
      id: "wifi",
      title: "Upgrade Wi‑Fi reliability",
      recommendation: "Audit access point coverage and increase bandwidth where needed.",
      impact: "High",
      keywords: ["wifi", "wi-fi", "wi fi", "internet"],
      minMentions: 5,
      minNegativePct: 30,
    },
    {
      id: "cleanliness",
      title: "Deepen housekeeping checks",
      recommendation: "Tighten room inspection checklist and spot-audit common areas.",
      impact: "Medium",
      keywords: ["clean", "dirty", "dust", "stain", "smell"],
      minMentions: 6,
      minNegativePct: 30,
    },
    {
      id: "noise",
      title: "Soundproofing / quiet-hours policy",
      recommendation: "Add soft-close hardware and enforce quiet hours on noisy floors.",
      impact: "Medium",
      keywords: ["noise", "noisy", "loud", "thin walls", "street noise"],
      minMentions: 4,
      minNegativePct: 30,
    },
    {
      id: "breakfast",
      title: "Standardize breakfast quality",
      recommendation: "Improve consistency of items and replenish buffet during peak times.",
      impact: "Low",
      keywords: ["breakfast", "buffet", "eggs", "coffee"],
      minMentions: 5,
      requireMixed: true,
    },
  ];

  for (const rule of byRule) {
    const subset = reviews.filter((r) => mentionsAny(`${r.title || ""} ${r.text || ""}`, rule.keywords));
    const mentions = subset.length;
    if (mentions < rule.minMentions) continue;

    const neg = subset.filter(isNegative).length;
    const pos = subset.length - neg;
    const pctNeg = subset.length ? (neg / subset.length) * 100 : 0;

    if (rule.minNegativePct != null && pctNeg < rule.minNegativePct) continue;
    if (rule.requireMixed && !(neg > 0 && pos > 0)) continue;

    res.push({
      id: rule.id,
      title: rule.title,
      recommendation: rule.recommendation,
      impact: rule.impact,
      evidence: {
        mentions,
        recentExamples: pickRecentExamples(subset, 2),
      },
    });
  }

  return res;
}
