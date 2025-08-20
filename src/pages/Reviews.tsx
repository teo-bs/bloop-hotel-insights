import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsContent as TabsContentType, TabsTrigger } from "@/components/ui/tabs";
import { useReviews, type ReviewPlatform, type Sentiment } from "@/stores/reviews";
import { useGlobalDateFilter, setGlobalDateFilter } from "@/stores/filters";
import { useReviewFilters, setReviewFilters, resetReviewFilters, type DatePreset } from "@/stores/reviewFilters";
import { filterReviews } from "@/lib/metrics";
import { cn } from "@/lib/utils";
import { CalendarIcon, Filter, X, TrendingUp, TrendingDown, Clock, MessageSquare, CheckCircle, AlertCircle, Star, BarChart3, PieChart, Plus } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie } from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";

function toStr(d: Date) { return d.toISOString().slice(0,10); }

const PLATFORM_LABELS: Record<ReviewPlatform, string> = {
  google: "Google",
  tripadvisor: "TripAdvisor",
  booking: "Booking",
};

const SENTIMENT_OPTIONS: Array<{ val: "all" | Sentiment; label: string }> = [
  { val: "all", label: "All" },
  { val: "positive", label: "+" },
  { val: "neutral", label: "•" },
  { val: "negative", label: "–" },
];

export default function ReviewsPage() {
  const reviews = useReviews();
  const dateGlobal = useGlobalDateFilter();
  const filters = useReviewFilters();
  const [search, setSearch] = useState(filters.query);
  const tableRef = useRef<HTMLTableElement>(null);

  // Topics list from data (fallback to common)
  const allTopics = useMemo(() => {
    const s = new Set<string>(["cleanliness","staff","breakfast","wifi","room","location","noise","check-in"]);
    for (const r of reviews) {
      const ts = (r as any).topics as string[] | undefined;
      if (ts) ts.forEach((t) => s.add(String(t).toLowerCase()));
    }
    return Array.from(s).sort();
  }, [reviews]);

  // URL <-> store sync
  useEffect(() => {
    // hydrate from URL hash once
    const h = window.location.hash;
    if (h.startsWith("#reviews?")) {
      const q = new URLSearchParams(h.slice("#reviews?".length));
      const platforms = q.get("platform")?.split(",").filter(Boolean) as ReviewPlatform[] | undefined;
      const sentiment = (q.get("sentiment") as any) || undefined;
      const topic = q.get("topic");
      const query = q.get("query") || "";
      const start = q.get("start") || filters.start;
      const end = q.get("end") || filters.end;
      const datePreset = (q.get("preset") as DatePreset) || filters.datePreset;
      setReviewFilters({ platforms: platforms || [], sentiment: (sentiment ?? "all") as any, topics: topic ? topic.split(",") : [], query, start, end, datePreset });
      setGlobalDateFilter({ start, end });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // write to URL hash on changes
    const q = new URLSearchParams();
    if (filters.platforms.length) q.set("platform", filters.platforms.join(","));
    if (filters.sentiment !== "all") q.set("sentiment", filters.sentiment);
    if (filters.topics.length) q.set("topic", filters.topics.join(","));
    if (filters.query) q.set("query", filters.query);
    if (filters.start) q.set("start", filters.start);
    if (filters.end) q.set("end", filters.end);
    if (filters.datePreset) q.set("preset", filters.datePreset);
    const hash = `#reviews?${q.toString()}`;
    if (window.location.hash !== hash) window.location.hash = hash;
  }, [filters]);

  // Debounce search -> store
  useEffect(() => {
    const t = setTimeout(() => setReviewFilters({ query: search }), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Derive filtered rows
  const filtered = useMemo(() => {
    const window = { from: dateGlobal.start, to: dateGlobal.end };
    const base = filterReviews(reviews as any, window, {
      platform: filters.platforms,
      sentiment: filters.sentiment === "all" ? undefined : [filters.sentiment as Sentiment],
      topic: filters.topics,
    });
    const q = filters.query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((r) => (r.title || "").toLowerCase().includes(q) || (r.text || "").toLowerCase().includes(q));
  }, [reviews, dateGlobal, filters]);

  useEffect(() => {
    // move focus to table on update for a11y
    tableRef.current?.focus({ preventScroll: true });
  }, [filtered]);

  // Mock data for charts and metrics
  const mockData = useMemo(() => {
    const sentimentCounts = filtered.reduce((acc, review) => {
      const sentiment = (review as any).sentiment || (review.rating >= 4 ? "positive" : review.rating === 3 ? "neutral" : "negative");
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalReviews = filtered.length;
    const positivePercentage = totalReviews > 0 ? Math.round((sentimentCounts.positive || 0) / totalReviews * 100) : 0;
    
    // Overall sentiment
    let overallSentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
    if (positivePercentage >= 60) overallSentiment = "Positive";
    else if (positivePercentage <= 30) overallSentiment = "Negative";

    // Performance evolution data
    const performanceData = [
      { date: "Sep", rating: 4.2, reviews: 45 },
      { date: "Oct", rating: 4.1, reviews: 52 },
      { date: "Nov", rating: 4.3, reviews: 48 },
      { date: "Dec", rating: 4.4, reviews: 61 },
      { date: "Jan", rating: 4.3, reviews: 55 },
      { date: "Feb", rating: 4.5, reviews: 67 }
    ];

    // Daily reviews data
    const dailyReviewsData = Array.from({ length: 15 }, (_, i) => ({
      day: i + 1,
      reviews: Math.floor(Math.random() * 8) + 1
    }));

    // Sentiment trend data
    const sentimentTrendData = Array.from({ length: 6 }, (_, i) => ({
      month: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i],
      positive: Math.floor(Math.random() * 40) + 30,
      neutral: Math.floor(Math.random() * 20) + 10,
      negative: Math.floor(Math.random() * 15) + 5
    }));

    // Trending topics
    const trendingTopics = [
      { topic: "Food", mentions: 52, positivity: 87, rank: 1, trend: "up" },
      { topic: "Cleanliness", mentions: 52, positivity: 95, rank: 2, trend: "down" },
      { topic: "Personal Attitude", mentions: 48, positivity: 92, rank: 3, trend: "up" },
      { topic: "Views", mentions: 45, positivity: 87, rank: 4, trend: "up" },
      { topic: "Comfort", mentions: 42, positivity: 84, rank: 5, trend: "down" }
    ];

    // Platform data
    const platformData = {
      google: { rating: 4.3, reviews: 86, connected: true },
      tripadvisor: { rating: 0, reviews: 0, connected: false },
      booking: { rating: 0, reviews: 0, connected: false }
    };

    return {
      sentimentCounts,
      overallSentiment,
      positivePercentage,
      performanceData,
      dailyReviewsData,
      sentimentTrendData,
      trendingTopics,
      platformData,
      responseTime: "12hrs",
      responseRate: 67,
      responseRateTrend: 10
    };
  }, [filtered]);

  const themeOptions = [
    "Food", "Cleanliness", "Atmosphere", "Room-Service", "Views", "Wi-Fi Speed",
    "Comfort", "Amenities", "Gym", "Spa", "Price", "Breakfast"
  ];

  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  // Control handlers
  const onPresetChange = (preset: DatePreset) => {
    const end = new Date();
    const start = new Date();
    if (preset === "last_7") start.setDate(end.getDate() - 6);
    else if (preset === "last_30") start.setDate(end.getDate() - 29);
    else if (preset === "last_90") start.setDate(end.getDate() - 89);
    const next = { start: toStr(start), end: toStr(end) };
    setReviewFilters({ datePreset: preset, ...next });
    setGlobalDateFilter({ start: next.start, end: next.end });
  };

  const onSentimentToggle = (val: string) => setReviewFilters({ sentiment: (val || "all") as any });

  return (
    <div className="container mx-auto px-4 md:px-6 xl:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Reviews</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetReviewFilters} aria-label="Clear filters">
            <X className="h-4 w-4 mr-2" /> Clear Filters
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Time Period:</Label>
            <Select value={filters.datePreset} onValueChange={onPresetChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7">Last 7 days</SelectItem>
                <SelectItem value="last_30">Last 30 days</SelectItem>
                <SelectItem value="last_90">Last 90 days</SelectItem>
                <SelectItem value="custom">6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section A - General Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">General Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Guest Sentiment */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-help">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      mockData.overallSentiment === "Positive" ? "bg-green-100" : 
                      mockData.overallSentiment === "Negative" ? "bg-red-100" : "bg-yellow-100"
                    )}>
                      {mockData.overallSentiment === "Positive" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : mockData.overallSentiment === "Negative" ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Sentiment</p>
                      <p className="text-lg font-bold text-slate-900">{mockData.overallSentiment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Overall mood of guest feedback across all sources.</p>
            </TooltipContent>
          </Tooltip>

          {/* Response Speed */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-help">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">AVG Response Time</p>
                      <p className="text-lg font-bold text-slate-900">{mockData.responseTime}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600">+29% since last 6 months</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>How quickly your team replies to guest reviews.</p>
            </TooltipContent>
          </Tooltip>

          {/* Response Rate */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-help">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Response Rate</p>
                      <p className="text-lg font-bold text-slate-900">{mockData.responseRate}%</p>
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600">+{mockData.responseRateTrend}% since last 6 months</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Percentage of reviews that received a management response.</p>
            </TooltipContent>
          </Tooltip>

          {/* Performance Evolution */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-help lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Performance Evolution</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-primary">150</span>
                        <span className="text-xs text-slate-500">Reviews</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">Performance</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">+2.45%</span>
                        </div>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">Positive</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">6 months</Badge>
                  </div>
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockData.performanceData}>
                        <Line 
                          type="monotone" 
                          dataKey="rating" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="reviews" 
                          stroke="#94A3B8" 
                          strokeWidth={1}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Track progress across months to see improvement or risk areas.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Section B - Reviews */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Platform Cards */}
          <div className="space-y-4">
            {/* Google */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-help">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src="/logos/google.svg" alt="Google" className="w-8 h-8" />
                        <div>
                          <h3 className="font-semibold text-slate-900">Google</h3>
                          {mockData.platformData.google.connected ? (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-slate-900">{mockData.platformData.google.rating}</span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn("w-3 h-3", i < Math.floor(mockData.platformData.google.rating) ? "text-yellow-400 fill-current" : "text-slate-300")} />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">Not connected</p>
                          )}
                        </div>
                      </div>
                      {mockData.platformData.google.connected ? (
                        <div className="text-right">
                          <p className="text-sm text-slate-600">{mockData.platformData.google.reviews}%</p>
                          <p className="text-xs text-slate-500">Based on 45 traveller reviews</p>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm">Connect Account</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Latest rating based on verified guest reviews from this platform.</p>
              </TooltipContent>
            </Tooltip>

            {/* Booking.com */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-help">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src="/logos/booking.svg" alt="Booking.com" className="w-8 h-8" />
                        <div>
                          <h3 className="font-semibold text-slate-900">Booking</h3>
                          <p className="text-sm text-slate-500">Not connected</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Connect account to sync reviews.</p>
              </TooltipContent>
            </Tooltip>

            {/* TripAdvisor */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-help">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src="/logos/tripadvisor.svg" alt="TripAdvisor" className="w-8 h-8" />
                        <div>
                          <h3 className="font-semibold text-slate-900">TripAdvisor</h3>
                          <p className="text-sm text-slate-500">Not connected</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Connect account to sync reviews.</p>
              </TooltipContent>
            </Tooltip>

            {/* Add Platform */}
            <Card className="bg-white/95 backdrop-blur-xl border-2 border-dashed border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 flex items-center justify-center">
                <Button variant="ghost" className="flex items-center gap-2 text-slate-600">
                  <Plus className="w-4 h-4" />
                  Add Platform
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Daily Reviews Chart */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-help">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">Daily Reviews</CardTitle>
                      <p className="text-sm text-slate-600">How many guests are talking about you each day.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">+2.45%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-3xl font-bold text-primary">25</span>
                    <span className="text-sm text-slate-500">Daily Reviews</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockData.dailyReviewsData}>
                        <Bar dataKey="reviews" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Spot peaks in guest activity and tie them to campaigns/events.</p>
            </TooltipContent>
          </Tooltip>

          {/* Latest Reviews */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-help">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-slate-900">Latest Guest Feedback</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <ToggleGroup type="single" value={filters.sentiment} onValueChange={onSentimentToggle} size="sm">
                      <ToggleGroupItem value="positive" variant="outline" className="text-xs">Positive</ToggleGroupItem>
                      <ToggleGroupItem value="neutral" variant="outline" className="text-xs">Neutral</ToggleGroupItem>
                      <ToggleGroupItem value="negative" variant="outline" className="text-xs">Negative</ToggleGroupItem>
                      <ToggleGroupItem value="all" variant="outline" className="text-xs">All</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  <div className="space-y-3">
                    {filtered.slice(0, 4).map((review) => {
                      const sentiment = (review as any).sentiment || (review.rating >= 4 ? "positive" : review.rating === 3 ? "neutral" : "negative");
                      return (
                        <div key={review.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-slate-900">Guest {review.id.slice(0, 8)}</span>
                              <Badge 
                                className={cn(
                                  "text-xs",
                                  sentiment === "positive" ? "bg-green-100 text-green-800" :
                                  sentiment === "negative" ? "bg-red-100 text-red-800" :
                                  "bg-yellow-100 text-yellow-800"
                                )}
                              >
                                {sentiment}
                              </Badge>
                              <span className="text-xs text-slate-500">{review.date}</span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">{review.text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <img 
                                src={`/logos/${review.platform}.svg`} 
                                alt={review.platform} 
                                className="w-4 h-4" 
                              />
                              <Button variant="outline" size="sm" className="text-xs h-6">
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stay on top of the latest guest opinions and respond instantly.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Section C - Sentiment */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Sentiment</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* 6 Months Sentiment */}
            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">6 Months Sentiment</CardTitle>
                <p className="text-sm text-slate-600">Positive, neutral, negative feedback over time.</p>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData.sentimentTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,6,23,0.06)" />
                      <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                      <RechartsTooltip />
                      <Bar dataKey="negative" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="neutral" stackId="a" fill="#94A3B8" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="positive" stackId="a" fill="#10B981" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Negative</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <span className="text-xs text-slate-600">Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Positive</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">Trending Topics</CardTitle>
                <p className="text-sm text-slate-600">Top recurring themes in reviews, with positivity score.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.trendingTopics.map((topic) => (
                    <div key={topic.topic} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                          {topic.rank}
                        </span>
                        {topic.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <span className="font-medium text-sm text-slate-900">{topic.topic}</span>
                          <p className="text-xs text-slate-500">{topic.mentions} Mentions - {topic.positivity}% Positive</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-sm text-primary">
                  View full leaderboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Sentiment Pie Chart */}
            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">Sentiment</CardTitle>
                <p className="text-sm text-slate-600">Overall guest sentiment distribution.</p>
                <Badge variant="outline" className="text-xs w-fit">6 months</Badge>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center">
                  <div className="relative">
                    <ResponsiveContainer width={200} height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'Positive', value: 63, fill: '#10B981' },
                            { name: 'Neutral', value: 12, fill: '#94A3B8' },
                            { name: 'Negative', value: 25, fill: '#EF4444' }
                          ]}
                          cx={100}
                          cy={100}
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-lg font-bold text-slate-900">63%</span>
                      <span className="text-xs text-slate-500">Positive</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-slate-600">Positive</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">63%</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-xs text-slate-600">Neutral</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">12%</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-slate-600">Negative</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Positive Feedback */}
            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">Top Positive Feedback</CardTitle>
                <p className="text-sm text-slate-600">What guests consistently love.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Food", mentions: 52, positivity: 97, rank: 1 },
                    { name: "Personal Attitude", mentions: 50, positivity: 91, rank: 3 },
                    { name: "Views", mentions: 49, positivity: 87, rank: 4 },
                    { name: "Amenities", mentions: 48, positivity: 87, rank: 6 }
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-semibold">
                          {item.rank}
                        </span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <div>
                          <span className="font-medium text-sm text-slate-900">{item.name}</span>
                          <p className="text-xs text-slate-500">{item.mentions} Mentions - {item.positivity}% Positive</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-sm text-primary">
                  View full leaderboard
                </Button>
              </CardContent>
            </Card>

            {/* Worst Negative Feedback */}
            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">Worst Negative Feedback</CardTitle>
                <p className="text-sm text-slate-600">Recurring pain points dragging reputation down.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Spa", mentions: 52, positivity: 95, rank: 9 },
                    { name: "Wi-Fi Speed", mentions: 49, positivity: 87, rank: 7 },
                    { name: "Comfort", mentions: 48, positivity: 87, rank: 5 },
                    { name: "Cleanliness", mentions: 48, positivity: 87, rank: 3 }
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-semibold">
                          {item.rank}
                        </span>
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <div>
                          <span className="font-medium text-sm text-slate-900">{item.name}</span>
                          <p className="text-xs text-slate-500">{item.mentions} Mentions - {item.positivity}% Positive</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-sm text-primary">
                  View full leaderboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Theme Selector */}
        <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900">Select Themes</CardTitle>
            <p className="text-sm text-slate-600">Filter insights by topics you care about most.</p>
            <Badge variant="outline" className="text-xs w-fit">6 months</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((theme) => (
                <Button
                  key={theme}
                  variant={selectedThemes.includes(theme) ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    if (selectedThemes.includes(theme)) {
                      setSelectedThemes(selectedThemes.filter(t => t !== theme));
                    } else {
                      setSelectedThemes([...selectedThemes, theme]);
                    }
                  }}
                >
                  {theme}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="text-xs border-dashed">
                type your own…
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
