import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviews } from "@/stores/reviews";
import { useGlobalDateFilter } from "@/stores/filters";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";
import { filterReviews, calcAvgRating, calcTotals, calcTopTopic, calcTrendSeries, calcTopicCounts } from "@/lib/metrics";
import { generateInsights, type Insight } from "@/lib/insights";
import { Lightbulb } from "lucide-react";

// Helper to compute daily average series for the first chart
function buildDailyAvgData(revs: Array<{ date: string; rating: number }>) {
  const byDay: Record<string, { day: string; sum: number; count: number; avg_norm_rating: number }> = {};
  for (const r of revs) {
    const day = r.date;
    if (!day) continue;
    byDay[day] ||= { day, sum: 0, count: 0, avg_norm_rating: 0 };
    byDay[day].sum += r.rating || 0;
    byDay[day].count += 1;
  }
  return Object.values(byDay)
    .sort((a, b) => a.day.localeCompare(b.day))
    .map((d) => ({ day: d.day, avg_norm_rating: d.count ? d.sum / d.count : 0 }));
}

export default function Dashboard() {
  const reviews = useReviews();
  const { start, end } = useGlobalDateFilter();
  const [isRecomputing, setIsRecomputing] = useState(false);

  // Metrics state
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [pctPositive, setPctPositive] = useState(0);
  const [topTopic, setTopTopic] = useState("—");
  const [dailyAvgData, setDailyAvgData] = useState<Array<{ day: string; avg_norm_rating: number }>>([]);
  const [trendData, setTrendData] = useState<Array<{ weekStartISO: string; positive: number; neutral: number; negative: number }>>([]);
  const [topicBars, setTopicBars] = useState<Array<{ topic: string; count: number }>>([]);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [smallData, setSmallData] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});


  const recompute = () => {
    const window = { from: start, to: end };
    const filtered = filterReviews(reviews as any, window, {});
    setAvgRating(calcAvgRating(filtered));
    const totals = calcTotals(filtered);
    setTotalReviews(totals.total);
    setPctPositive(totals.positivePct);
    setTopTopic(calcTopTopic(filtered));
    setDailyAvgData(buildDailyAvgData(filtered as any));
    setTrendData(calcTrendSeries(filtered));
    setTopicBars(calcTopicCounts(filtered).slice(0, 8));

    // Insights
    setSmallData(filtered.length < 30);
    const allInsights = generateInsights(filtered as any);
    const weight: Record<Insight["impact"], number> = { High: 3, Medium: 2, Low: 1 };
    const top = allInsights
      .sort((a, b) => (weight[b.impact] - weight[a.impact]) || (b.evidence.mentions - a.evidence.mentions))
      .slice(0, 3);
    setInsights(top);
  };

  // Debounced recompute on dependencies and manual refresh
  useEffect(() => {
    setIsRecomputing(true);
    const t = setTimeout(() => {
      recompute();
      setIsRecomputing(false);
    }, 150);
    return () => clearTimeout(t);
  }, [reviews, start, end, refreshNonce]);

  // Manual refresh handler
  const handleRefreshMetrics = () => {
    setIsRecomputing(true);
    setRefreshNonce((n) => n + 1);
  };

  // Listen for global updates
  useEffect(() => {
    const onUpdated = () => setRefreshNonce((n) => n + 1);
    window.addEventListener("reviews-updated", onUpdated);
    return () => window.removeEventListener("reviews-updated", onUpdated);
  }, []);

  // SEO + anchor scroll
  useEffect(() => {
    document.title = "Hotel Reviews Dashboard – Padu";
    if (typeof window !== "undefined" && window.location.hash === "#metrics") {
      const el = document.getElementById("metrics");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="p-6 md:p-8 xl:p-10 space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hotel Reviews Dashboard</h1>
        <div className="flex gap-2">
          <Button id="btn-refresh-metrics" variant="secondary" onClick={handleRefreshMetrics}>Refresh metrics</Button>
        </div>
      </div>

      {/* KPI cards */}
      <div id="metrics" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Avg Rating</CardTitle></CardHeader>
          <CardContent>
            {isRecomputing ? <Skeleton className="h-8 w-24" /> : <div className="text-3xl font-semibold">{avgRating.toFixed(1)}</div>}
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

      {/* Insights */}
      <Card id="insights-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-500" /> Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {smallData && (
            <div className="text-xs text-muted-foreground">Limited data (&lt;30 reviews). Insights may be less reliable.</div>
          )}
          {isRecomputing ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : insights.length ? (
            <div className="grid gap-3 md:grid-cols-3">
              {insights.map((ins, i) => (
                <div id={`insight-card-${i + 1}`} key={ins.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{ins.title}</div>
                      <div className="text-sm text-muted-foreground">{ins.recommendation}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))}
                      aria-expanded={!!expanded[i]}
                      aria-controls={`insight-details-${i}`}
                    >
                      {expanded[i] ? "Hide details" : "View details"}
                    </Button>
                  </div>
                  {expanded[i] && (
                    <div id={`insight-details-${i}`} className="mt-2 text-sm">
                      <div className="text-muted-foreground mb-1">Mentions: {ins.evidence.mentions}</div>
                      <ul className="list-disc pl-5 space-y-1">
                        {ins.evidence.recentExamples.map((ex, idx) => (
                          <li key={idx}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No insights available for the current selection.</div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Average Rating (Normalized to 5)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyAvgData}>
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
            <CardTitle>Review Volume by Sentiment (Weekly)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekStartISO" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" stackId="a" fill="hsl(var(--chart-1))" name="Positive" />
                <Bar dataKey="neutral" stackId="a" fill="hsl(var(--chart-2))" name="Neutral" />
                <Bar dataKey="negative" stackId="a" fill="hsl(var(--chart-3))" name="Negative" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Topic bars */}
      <Card>
        <CardHeader>
          <CardTitle>Top Topics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isRecomputing ? (
            <>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-9/12" />
            </>
          ) : (
            <div className="space-y-2">
              {topicBars.slice(0, 8).map((t) => (
                <div key={t.topic} className="flex items-center gap-3">
                  <div className="w-28 text-sm capitalize">{t.topic}</div>
                  <div className="flex-1 h-2 rounded bg-muted">
                    <div
                      className="h-2 rounded bg-primary"
                      style={{ width: `${Math.min(100, (t.count / (topicBars[0]?.count || 1)) * 100)}%` }}
                      aria-label={`${t.topic} count`}
                    />
                  </div>
                  <div className="w-8 text-right text-sm tabular-nums">{t.count}</div>
                </div>
              ))}
              {topicBars.length === 0 && <div className="text-sm text-muted-foreground">No topics yet</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
