import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReviews, type ReviewPlatform, type Sentiment } from "@/stores/reviews";
import { useGlobalDateFilter, setGlobalDateFilter } from "@/stores/filters";
import { useReviewFilters, setReviewFilters, resetReviewFilters, type DatePreset } from "@/stores/reviewFilters";
import { filterReviews } from "@/lib/metrics";
import { cn } from "@/lib/utils";
import { CalendarIcon, Filter, X } from "lucide-react";
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

  const onPlatformToggle = (vals: string[]) => setReviewFilters({ platforms: vals as ReviewPlatform[] });
  const onSentimentToggle = (val: string) => setReviewFilters({ sentiment: (val || "all") as any });

  const onTopicToggle = (topic: string, checked: boolean) => {
    const set = new Set(filters.topics);
    if (checked) set.add(topic); else set.delete(topic);
    setReviewFilters({ topics: Array.from(set) });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 xl:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Reviews</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetReviewFilters} aria-label="Clear filters">
              <X className="h-4 w-4 mr-2" /> Clear
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <Card id="reviews-filterbar" className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
          <CardHeader className="pb-2 p-6">
            <CardTitle className="text-base flex items-center gap-2 text-slate-900">
              <Filter className="h-4 w-4" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-end">
              {/* Date preset */}
              <div className="space-y-1">
                <Label htmlFor="date-preset">Date range</Label>
                <div className="flex items-center gap-2">
                  <Select value={filters.datePreset} onValueChange={onPresetChange}>
                    <SelectTrigger id="date-preset" className="w-40"><SelectValue placeholder="Preset" /></SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      <SelectItem value="last_7">Last 7 days</SelectItem>
                      <SelectItem value="last_30">Last 30 days</SelectItem>
                      <SelectItem value="last_90">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Open calendar"><CalendarIcon className="h-4 w-4" /></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                      <div className="p-3 pointer-events-auto">
                        <Calendar
                          mode="range"
                          selected={{ from: new Date(filters.start), to: new Date(filters.end) } as any}
                          onSelect={(r: any) => {
                            const start = r?.from ? toStr(r.from) : filters.start;
                            const end = r?.to ? toStr(r.to) : start;
                            setReviewFilters({ datePreset: "custom", start, end });
                            setGlobalDateFilter({ start, end });
                          }}
                          initialFocus
                          className={cn("p-0 pointer-events-auto")}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Platforms */}
              <div className="space-y-1">
                <Label>Platform</Label>
                <ToggleGroup type="multiple" value={filters.platforms} onValueChange={onPlatformToggle} className="flex flex-wrap gap-2">
                  {Object.keys(PLATFORM_LABELS).map((p) => (
                    <ToggleGroupItem key={p} value={p} aria-label={PLATFORM_LABELS[p as ReviewPlatform]}>
                      {PLATFORM_LABELS[p as ReviewPlatform]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Sentiment */}
              <div className="space-y-1">
                <Label>Sentiment</Label>
                <ToggleGroup type="single" value={filters.sentiment} onValueChange={onSentimentToggle} className="flex gap-2">
                  {SENTIMENT_OPTIONS.map((s) => (
                    <ToggleGroupItem key={s.val} value={s.val} aria-label={`Sentiment ${s.label}`}>
                      {s.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Topics */}
              <div className="space-y-1">
                <Label>Topic</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-between w-full">
                      {filters.topics.length ? `${filters.topics.length} selected` : "All topics"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-50 bg-popover w-64" align="start">
                    <div className="max-h-64 overflow-auto pr-1">
                      {allTopics.map((t) => (
                        <label key={t} className="flex items-center gap-2 py-1 cursor-pointer">
                          <Checkbox checked={filters.topics.includes(t)} onCheckedChange={(c) => onTopicToggle(t, Boolean(c))} aria-label={`Topic ${t}`} />
                          <span className="capitalize text-sm">{t}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search */}
              <div className="space-y-1 col-span-1 xl:col-span-1">
                <Label htmlFor="reviews-search">Search</Label>
                <Input id="reviews-search" placeholder="Search text or title" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results meta */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing <span className="font-medium">{filtered.length}</span> result{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Table */}
        <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-600">No reviews match your filters. Try clearing some filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table id="reviews-table" ref={tableRef as any} tabIndex={-1}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[110px]">Date</TableHead>
                      <TableHead className="min-w-[120px]">Platform</TableHead>
                      <TableHead className="min-w-[80px]">Rating</TableHead>
                      <TableHead className="min-w-[100px]">Sentiment</TableHead>
                      <TableHead className="min-w-[200px]">Title</TableHead>
                      <TableHead>Text</TableHead>
                      <TableHead className="min-w-[180px]">Topics</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => {
                      const s = (r as any).sentiment as Sentiment | undefined;
                      const derived: Sentiment = s || (r.rating >= 4 ? "positive" : r.rating === 3 ? "neutral" : "negative");
                      const topics = ((r as any).topics as string[] | undefined) || [];
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="whitespace-nowrap">{r.date}</TableCell>
                          <TableCell className="capitalize">{r.platform}</TableCell>
                          <TableCell>{r.rating.toFixed(1)}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-xs",
                                derived === "positive" && "bg-green-500/15 text-green-600 dark:text-green-400",
                                derived === "neutral" && "bg-foreground/10 text-foreground/70",
                                derived === "negative" && "bg-red-500/15 text-red-600 dark:text-red-400"
                              )}
                              aria-label={`Sentiment ${derived}`}
                            >
                              {derived}
                            </span>
                          </TableCell>
                          <TableCell className="truncate max-w-[260px]">{r.title || "—"}</TableCell>
                          <TableCell className="truncate max-w-[520px]">{r.text}</TableCell>
                          <TableCell className="truncate max-w-[260px]">
                            {topics.length ? topics.join(", ") : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
