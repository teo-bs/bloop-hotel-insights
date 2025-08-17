import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Lightbulb } from "lucide-react";
import { onSavePreviewGuard } from "@/lib/savePreview";
import { useToast } from "@/hooks/use-toast";
import { getPlacesPreview, getPlaceSuggestions } from "@/lib/api/googlePlaces";
import { openIntegrationsModal } from "@/lib/actions";
import { redirectToApp } from "@/utils/domain";
import { useAuth } from "@/contexts/AuthContext";
export default function Index() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user, session, loading: authLoading } = useAuth();

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const sessionTokenRef = useRef<string>("");

  useEffect(() => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = (globalThis.crypto as any)?.randomUUID?.() || String(Date.now());
    }
  }, []);

  // Debounced fetch of suggestions
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }
    const t = setTimeout(async () => {
      setLoadingSuggest(true);
      try {
        const list = await getPlaceSuggestions(q, sessionTokenRef.current);
        setSuggestions(list);
        setShowSuggestions(true);
        setActiveIndex(-1);
      } catch (e) {
        setSuggestions([]);
        setShowSuggestions(true); // show "no matches"
      } finally {
        setLoadingSuggest(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);
  async function handlePreview() {
    setError(null);
    setResult(null);
    const raw = query.trim();
    if (!raw) {
      setError("Please enter a business name.");
      return;
    }
    setLoading(true);
    try {
      const isUrl = /^(https?:)\/\//i.test(raw);
      const searchUrl = isUrl
        ? raw
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;

      const FUNCTION_URL =
        "https://hewcaikalseorcmmjark.supabase.co/functions/v1/google-places-preview";
      const url = `${FUNCTION_URL}?url=${encodeURIComponent(searchUrl)}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        const status = data?.details?.status || data?.status || data?.error || "";
        const map: Record<string, string> = {
          REQUEST_DENIED: "Request denied – please try again later.",
          OVER_QUERY_LIMIT: "Over daily quota – try again later.",
          INVALID_REQUEST: "Invalid request – try a more specific name.",
          NOT_FOUND: "Place not found – try another name.",
          UNKNOWN_ERROR: "Temporary error – try again.",
          NO_PLACE_ID: "We couldn't resolve that business. Try including the city.",
        };
        throw new Error(
          map[status] || data?.details?.message || data?.error || `Request failed (${status || res.status})`
        );
      }
      setResult(data);
      (window as any).__paduLastPreview = data;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch preview. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function chooseSuggestion(s: any) {
    try {
      setError(null);
      setLoading(true);
      const data = await getPlacesPreview(s.place_id);
      setResult(data);
      setShowSuggestions(false);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch preview.");
    } finally {
      setLoading(false);
    }
  }
  async function handleSave() {
    setSaving(true);
    try {
      await onSavePreviewGuard(query, result);
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  // Derived KPIs and simple insight from preview
  const revs = (result?.reviews as any[]) || [];
  const avgVal = revs.length ? revs.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0) / revs.length : 4.3;
  const avgDisplay = avgVal.toFixed(1);
  const totalDisplay = (result?.place?.totalReviews as number) ?? (revs.length || 12482);
  const positivePct = revs.length ? Math.round((revs.filter((r: any) => Number(r.rating) >= 4).length / revs.length) * 100) : 72;
  const textBlob = revs.map((r: any) => String(r.text || "")).join(" ").toLowerCase();
  const hasLow = revs.some((r: any) => Number(r.rating) <= 3);
  let insight = "Standardize breakfast quality";
  let badge = "Medium impact";
  if (/(check-?in|reception|queue)/.test(textBlob) && hasLow) { insight = "Improve check‑in speed"; badge = "High impact"; }
  else if (/(wifi|wi-?fi|internet)/.test(textBlob) && hasLow) { insight = "Upgrade Wi‑Fi reliability"; badge = "High impact"; }
  else if (/(clean|dirty|smell|mold)/.test(textBlob)) { insight = "Deepen housekeeping checks"; badge = "Medium impact"; }

  // Simple count-up on reveal
  function CountUp({ value, duration = 800, decimals = 0 }: { value: number; duration?: number; decimals?: number }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let raf = 0;
      const start = performance.now();
      const from = 0;
      const to = Number(value) || 0;
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const current = from + (to - from) * p;
        setDisplay(current);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();
    return <span>{formatted}</span>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gpt5-gradient animate-gpt5-pan font-sans">
      {/* subtle noise overlay */}
      <div className="pointer-events-none absolute inset-0 noise-overlay" aria-hidden="true" />

      {/* Top-right persistent Login/Dashboard */}
        <div className="fixed right-6 top-6 z-30">
          {authLoading ? (
            <Button variant="ghost" className="rounded-full" disabled>
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </Button>
          ) : session ? (
            <Button
              id="btn-top-dashboard"
              variant="ghost"
              className="rounded-full"
              onClick={() => redirectToApp('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              id="btn-top-login"
              variant="ghost"
              className="rounded-full"
              onClick={() => document.dispatchEvent(new CustomEvent("auth:open", { detail: { mode: "signup" } }))}
            >
              Get Started
            </Button>
          )}
        </div>

      {/* Glassmorphic centered nav */}
      <nav id="nav-glass" aria-label="Primary" className="pointer-events-auto fixed left-1/2 top-6 z-20 -translate-x-1/2">
        <div className="flex items-center gap-6 rounded-full border border-input bg-card/70 px-5 py-2 backdrop-blur-md shadow-lg">
          <div className="h-3 w-3 rounded-full bg-foreground/50" aria-hidden="true" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="/#docs" className="rounded-full px-2 py-1 hover:text-foreground focus-ring">Docs</a>
            <a href="/#pricing" className="rounded-full px-2 py-1 hover:text-foreground focus-ring">Pricing</a>
          </div>
        </div>
      </nav>

      {/* Centered Hero */}
      <section className="relative z-10 flex items-center justify-center">
        <div className="w-full max-w-[860px] px-6 min-h-[calc(100vh-80px)] flex flex-col justify-center items-center gap-6 text-center relative">
          {/* Padu logo */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-background/70 backdrop-blur-md shadow-lg animate-[float-y_4s_ease-in-out_infinite_alternate]">
            <img
              id="padu-logo"
              src="/lovable-uploads/10e2e94b-0e70-490d-bc29-2f836e6ddf32.png"
              alt="Padu logo – hotel review insights"
              className="h-12 w-12 rounded-xl object-contain"
              width={48}
              height={48}
              loading="eager"
              decoding="async"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Understand your guests with Padu.</h1>
          <p className="mt-3 text-lg text-muted-foreground">AI review consolidation & insights — one clear picture.</p>

{/* Floating mini-cards rendered relative to search area below */}

          {/* Search capsule */}
          <div className="relative mx-auto mt-6 w-full max-w-[720px]">
            {/* Floating mini-cards positioned around the search */}

            <Input
              id="business-name-input"
              aria-label="Business name"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={showSuggestions}
              aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
              placeholder="Start typing your hotel name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
                  e.preventDefault();
                } else if (e.key === "ArrowUp") {
                  setActiveIndex((i) => Math.max(i - 1, 0));
                  e.preventDefault();
                } else if (e.key === "Enter") {
                  if (activeIndex >= 0 && suggestions[activeIndex]) {
                    void chooseSuggestion(suggestions[activeIndex]);
                    e.preventDefault();
                  } else {
                    void handlePreview();
                  }
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
              className="relative z-0 h-12 rounded-full px-5 pr-36 text-base shadow-inner focus-ring"
            />

            {loadingSuggest && (
              <span className="pointer-events-none absolute right-28 top-1/2 -translate-y-1/2 text-muted-foreground">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" aria-hidden="true" />
                <span className="sr-only">Loading suggestions</span>
              </span>
            )}

            <Button
              id="btn-preview-by-name"
              onClick={handlePreview}
              disabled={loading}
              aria-label="Preview"
              className="absolute right-1 top-1 h-10 rounded-full px-6"
              variant="hero"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                  Previewing…
                </span>
              ) : (
                "Preview"
              )}
            </Button>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div
                id="search-suggestions"
                role="listbox"
                className="absolute top-full mt-2 left-0 z-20 w-full max-h-80 overflow-auto rounded-xl border bg-card/90 backdrop-blur p-1 shadow-lg"
              >
                {suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">No matches. Try adding city or address.</div>
                ) : (
                  suggestions.map((s, i) => {
                    const active = i === activeIndex;
                    const optionId = `suggestion-${i}`;
                    return (
                      <button
                        key={s.place_id}
                        id={optionId}
                        role="option"
                        aria-selected={active}
                        data-idx={i}
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => chooseSuggestion(s)}
                        className={`w-full rounded-md px-4 py-3 text-left ${active ? "bg-accent/20" : "hover:bg-muted"}`}
                      >
                        <div className="font-medium">{s.main_text || s.description}</div>
                        {s.secondary_text && (
                          <div className="text-xs text-muted-foreground">{s.secondary_text}</div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-muted-foreground">We’ll instantly pull your last 5 Google reviews — no signup needed.</p>

          <div className="mx-auto mt-8 grid w-full max-w-[600px] grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              id="float-box-a"
              className="rounded-xl border bg-white/70 backdrop-blur-md p-6 shadow-lg animate-float-slow"
              role="status"
              aria-label={`Average rating ${avgDisplay}, total reviews ${totalDisplay}, positive ${positivePct}%`}
            >
              <div className="text-xs text-muted-foreground">Last 90 days</div>
              <div className="mt-1 text-2xl font-semibold inline-flex items-center gap-2">
                Avg <span aria-hidden>★</span> <span id="kpi-avg"><CountUp value={Number(avgDisplay)} decimals={1} /></span>
              </div>
              <div className="mt-1 text-sm">
                Reviews <span id="kpi-total"><CountUp value={Number(totalDisplay)} /></span> ·
                Positive <span id="kpi-positive"><CountUp value={Number(positivePct)} /></span>%
              </div>
              <div className="mt-2 flex items-center gap-3 opacity-70 grayscale" aria-hidden="true">
                <img src="/logos/google.svg" alt="Google reviews" className="h-4" />
                <img src="/logos/tripadvisor.svg" alt="Tripadvisor reviews" className="h-4" />
                <img src="/logos/booking.svg" alt="Booking.com reviews" className="h-4" />
              </div>
            </div>
            <div
              id="float-box-b"
              className="rounded-xl border bg-white/70 backdrop-blur-md p-6 shadow-lg animate-float-slow"
              role="status"
              aria-label={`Top insight: ${insight} (${badge})`}
            >
              <div className="text-xs text-muted-foreground">Top insight</div>
              <div className="mt-1 flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                <div className="text-sm" id="insight-title">{insight}</div>
              </div>
              <div className="mt-2 inline-flex rounded-full border px-2 py-0.5 text-xs" id="insight-badge">{badge}</div>
            </div>
          </div>
          <div id="preview-results" aria-live="polite" className="mx-auto mt-[72px] w-full max-w-[760px] text-left">
            {error && (
              <p role="alert" className="text-sm text-destructive">{error}</p>
            )}

            {result && (
              <div className="rounded-2xl border bg-background/80 p-5 backdrop-blur-md shadow-xl">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold">{result.place?.name ?? "Unnamed place"}</div>
                    <div className="text-sm text-muted-foreground">{result.place?.address ?? ""}</div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm sm:mt-0">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="font-medium">{result.place?.rating ?? "-"}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{result.place?.totalReviews ?? 0} total reviews</span>
                  </div>
                </div>
                <div className="my-4 border-t" />

                <ul className="space-y-4">
                  {(result.reviews || []).slice(0, 5).map((r: any, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        {r.profile_photo_url ? (
                          <AvatarImage src={r.profile_photo_url} alt={`${r.author_name || "Reviewer"} avatar`} />
                        ) : (
                          <AvatarFallback>{(r.author_name || "").slice(0, 2).toUpperCase() || "G"}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-sm font-medium max-w-[200px]">{r.author_name || "Anonymous"}</div>
                          <div className="inline-flex items-center gap-1 text-accent">
                            {Array.from({ length: Number(r.rating || 0) }).map((_, j) => (
                              <Star key={j} className="h-3.5 w-3.5 fill-current" />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{r.relative_time_description || ""}</span>
                        </div>
                        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{r.text || ""}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-muted-foreground">Data from Google. <span className="hidden sm:inline">No credit card required.</span></div>
                  <div className="flex items-center gap-2">
                     <Button
                       id="btn-save-preview"
                       onClick={handleSave}
                       disabled={saving}
                       aria-label="Save to dashboard (free)"
                       className="rounded-full"
                       variant="hero"
                     >
                       {saving ? (
                         <span className="inline-flex items-center gap-2">
                           <span className="h-4 w-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                           Saving…
                         </span>
                       ) : (
                         user ? "Save to dashboard" : "Save to dashboard (free)"
                       )}
                     </Button>
                    <Button
                      id="btn-upgrade-gbp"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => openIntegrationsModal()}
                    >
                      Connect Business Profile for full history
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
