import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviews } from "@/stores/reviews";
import { useGlobalDateFilter } from "@/stores/filters";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend,
} from "recharts";

function toDayStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function inRange(dateStr: string, start: string, end: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const ds = toDayStr(d);
  return ds >= start && ds <= end;
}

// Fallback helpers (for legacy rows without sentiment/topics)
function fallbackSentiment(rating: number): "pos" | "neu" | "neg" {
  if (rating >= 4) return "pos";
  if (rating <= 2) return "neg";
  return "neu";
}

function fallbackTopic(text: string): string {
  const t = text?.toLowerCase() || "";
  const topics: { key: string; kws: string[] }[] = [
    { key: "cleanliness", kws: ["clean", "dirty", "spotless", "hygiene"] },
    { key: "staff", kws: ["staff", "service", "team", "host"] },
    { key: "breakfast", kws: ["breakfast", "buffet"] },
    { key: "wifi", kws: ["wifi", "wi-fi", "internet"] },
    { key: "room", kws: ["room", "bed", "bathroom", "suite"] },
    { key: "location", kws: ["location", "walk", "near", "close", "area"] },
    { key: "noise", kws: ["noise", "noisy", "loud", "quiet"] },
  ];
  for (const tp of topics) {
    if (tp.kws.some((k) => t.includes(k))) return tp.key;
  }
  return "general";
}

export default function Dashboard() {
  const reviews = useReviews();
  const { start, end } = useGlobalDateFilter();
  const [isRecomputing, setIsRecomputing] = useState(false);

  // Filtered reviews by date
  const filtered = useMemo(() => reviews.filter((r) => inRange(r.date, start, end)), [reviews, start, end]);

  // Aggregate for charts
  const chartData = useMemo(() => {
    const byDay: Record<string, { day: string; reviews_count: number; avg_norm_rating: number; pos_cnt: number; neu_cnt: number; neg_cnt: number; sum: number }>
      = {} as any;
    for (const r of filtered) {
      const day = toDayStr(new Date(r.date));
      byDay[day] ||= { day, reviews_count: 0, avg_norm_rating: 0, pos_cnt: 0, neu_cnt: 0, neg_cnt: 0, sum: 0 };
      const b = byDay[day];
      b.reviews_count += 1;
      b.sum += r.rating;
      const sRaw = (r as any).sentiment as "positive" | "neutral" | "negative" | undefined;
      const s = sRaw ? (sRaw === "positive" ? "pos" : sRaw === "neutral" ? "neu" : "neg") : fallbackSentiment(r.rating);
      if (s === "pos") b.pos_cnt += 1; else if (s === "neu") b.neu_cnt += 1; else b.neg_cnt += 1;
    }
    return Object.values(byDay)
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((d) => ({ ...d, avg_norm_rating: d.reviews_count ? d.sum / d.reviews_count : 0 }));
  }, [filtered]);

  // KPIs
  const { avgRating, totalReviews, pctPositive, topTopic } = useMemo(() => {
    const total = filtered.length;
    let sum = 0;
    let pos = 0;
    const topicCounts: Record<string, number> = {};
    for (const r of filtered) {
      sum += r.rating;
      const sRaw = (r as any).sentiment as "positive" | "neutral" | "negative" | undefined;
      const s = sRaw ? (sRaw === "positive" ? "pos" : sRaw === "neutral" ? "neu" : "neg") : fallbackSentiment(r.rating);
      if (s === "pos") pos += 1;
      const topics = (r as any).topics as string[] | undefined;
      if (topics && topics.length) {
        for (const t of topics) topicCounts[t] = (topicCounts[t] || 0) + 1;
      } else {
        const t = fallbackTopic(r.text);
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      }
    }
    const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    return {
      avgRating: total ? (sum / total) : 0,
      totalReviews: total,
      pctPositive: total ? (pos / total) * 100 : 0,
      topTopic,
    };
  }, [filtered]);

  // Refresh handler with micro loading on KPI cards only
  const handleRefreshMetrics = async () => {
    setIsRecomputing(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsRecomputing(false);
  };

  useEffect(() => {
    const onUpdated = () => handleRefreshMetrics();
    window.addEventListener("reviews-updated", onUpdated);
    return () => window.removeEventListener("reviews-updated", onUpdated);
  }, []);

  return (
    <div className="p-6 md:p-8 xl:p-10 space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleRefreshMetrics}>Refresh metrics</Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Avg Rating</CardTitle></CardHeader>
          <CardContent>
            {isRecomputing ? <Skeleton className="h-8 w-24" /> : <div className="text-3xl font-semibold">{avgRating.toFixed(2)}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Reviews</CardTitle></CardHeader>
          <CardContent>
            {isRecomputing ? <Skeleton className="h-8 w-28" /> : <div className="text-3xl font-semibold">{totalReviews}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>% Positive</CardTitle></CardHeader>
          <CardContent>
            {isRecomputing ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-semibold">{pctPositive.toFixed(0)}%</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Topic</CardTitle></CardHeader>
          <CardContent>
            {isRecomputing ? <Skeleton className="h-8 w-32" /> : <div className="text-3xl font-semibold capitalize">{topTopic}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Average Rating (Normalized to 5)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="avg_norm_rating" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Volume by Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pos_cnt" stackId="a" fill="hsl(var(--chart-1))" name="Positive" />
                <Bar dataKey="neu_cnt" stackId="a" fill="hsl(var(--chart-2))" name="Neutral" />
                <Bar dataKey="neg_cnt" stackId="a" fill="hsl(var(--chart-3))" name="Negative" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
