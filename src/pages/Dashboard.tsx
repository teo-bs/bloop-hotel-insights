import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviews } from "@/stores/reviews";
import { useGlobalDateFilter } from "@/stores/filters";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";
import { filterReviews, calcAvgRating, calcTotals, calcTopTopic, calcTrendSeries, calcTopicCounts } from "@/lib/metrics";
import { generateInsights, type Insight } from "@/lib/insights";
import { Lightbulb, Calendar, TrendingUp, Users, Star, Hash } from "lucide-react";
import PerformanceEvolution from "@/components/analytics/PerformanceEvolution";

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

  // Mock data for new sections
  const sourcesHealth = [
    { platform: "Google Business Profile", status: "Connected", lastSync: "2 hours ago", logo: "/logos/google.svg" },
    { platform: "TripAdvisor", status: "Needs reconnect", lastSync: "3 days ago", logo: "/logos/tripadvisor.svg" },
    { platform: "Booking.com", status: "Connected", lastSync: "1 hour ago", logo: "/logos/booking.svg" },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="py-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Hotel Reviews Dashboard</h1>
          <div className="flex items-center gap-2 mt-2 text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>Last 90 days</span>
          </div>
        </div>
        <Button id="btn-refresh-metrics" variant="secondary" className="rounded-full" onClick={handleRefreshMetrics}>
          Refresh metrics
        </Button>
      </div>

      {/* Row 1: KPI Cards */}
      <div id="metrics" className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-0.5 transition-transform duration-200">
          <CardHeader className="p-6 md:p-8 pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-600 text-sm font-medium">
              <Star className="h-4 w-4" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0">
            {isRecomputing ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <div className="text-5xl font-bold tracking-tight text-slate-900">{avgRating.toFixed(1)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-0.5 transition-transform duration-200">
          <CardHeader className="p-6 md:p-8 pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-600 text-sm font-medium">
              <Users className="h-4 w-4" />
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0">
            {isRecomputing ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="text-5xl font-bold tracking-tight text-slate-900">{totalReviews}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-0.5 transition-transform duration-200">
          <CardHeader className="p-6 md:p-8 pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-600 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              % Positive
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0">
            {isRecomputing ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <div className="text-5xl font-bold tracking-tight text-slate-900">{pctPositive.toFixed(0)}%</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-0.5 transition-transform duration-200">
          <CardHeader className="p-6 md:p-8 pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-600 text-sm font-medium">
              <Hash className="h-4 w-4" />
              Top Topic
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0">
            {isRecomputing ? (
              <Skeleton className="h-12 w-32" />
            ) : (
              <div className="text-5xl font-bold tracking-tight text-slate-900 capitalize">{topTopic}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Performance Evolution */}
      <div className="mb-8">
        <PerformanceEvolution totalReviews={totalReviews} delta={2.45} positive={pctPositive >= 60} />
      </div>

      {/* Row 3: Insights */}
      <Card id="insights-panel" className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] mb-8">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          {smallData && (
            <div className="text-xs text-muted-foreground mb-4">Limited data (&lt;30 reviews). Insights may be less reliable.</div>
          )}
          {isRecomputing ? (
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : insights.length ? (
            <div className="grid gap-6 md:grid-cols-3">
              {insights.map((ins, i) => (
                <div key={ins.id} className="rounded-xl border border-slate-200/60 p-4 bg-white/50">
                  <div className="font-semibold text-slate-900 mb-1">{ins.title}</div>
                  <div className="text-sm text-slate-600 mb-3">{ins.recommendation}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))}
                  >
                    View details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No insights available for the current selection.</div>
          )}
        </CardContent>
      </Card>

      {/* Row 4: Two Columns */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0 mb-8">
        {/* Sentiment by Topic */}
        <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="text-2xl font-semibold text-slate-900">Sentiment by Topic</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,6,23,0.06)" />
                <XAxis dataKey="weekStartISO" tick={{ fill: '#94A3B8' }} />
                <YAxis tick={{ fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(15,23,42,.08)', backgroundColor: 'white' }}
                />
                <Legend />
                <Bar dataKey="positive" stackId="a" fill="#10B981" name="Positive" radius={[0, 0, 4, 4]} />
                <Bar dataKey="neutral" stackId="a" fill="#6B7280" name="Neutral" />
                <Bar dataKey="negative" stackId="a" fill="#EF4444" name="Negative" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Health */}
        <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="text-2xl font-semibold text-slate-900">Source Health</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0">
            <div className="space-y-4">
              {sourcesHealth.map((source) => (
                <div key={source.platform} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <img src={source.logo} alt={source.platform} className="h-6 w-6" />
                    <div>
                      <div className="font-medium text-slate-900">{source.platform}</div>
                      <div className="text-sm text-slate-500">Last sync: {source.lastSync}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    source.status === "Connected" 
                      ? "bg-green-50 text-green-700" 
                      : "bg-red-50 text-red-700"
                  }`}>
                    {source.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Recent Reviews (placeholder for now) */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-2xl font-semibold text-slate-900">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <div className="text-sm text-muted-foreground">Recent reviews feed will be implemented here with filters and pagination.</div>
        </CardContent>
      </Card>
    </div>
  );
}