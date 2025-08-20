import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Star, Lightbulb, Menu } from "lucide-react";
import { onSavePreviewGuard } from "@/lib/savePreview";
import { useToast } from "@/hooks/use-toast";
import { getPlacesPreview, getPlaceSuggestions } from "@/lib/api/googlePlaces";
import { openIntegrationsModal } from "@/lib/actions";
import { redirectToApp } from "@/utils/domain";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
export default function Index() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const {
    toast
  } = useToast();
  const {
    user,
    session,
    loading: authLoading
  } = useAuth();
  const isMobile = useIsMobile();

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
      const searchUrl = isUrl ? raw : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;
      const FUNCTION_URL = "https://hewcaikalseorcmmjark.supabase.co/functions/v1/google-places-preview";
      const url = `${FUNCTION_URL}?url=${encodeURIComponent(searchUrl)}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
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
          NO_PLACE_ID: "We couldn't resolve that business. Try including the city."
        };
        throw new Error(map[status] || data?.details?.message || data?.error || `Request failed (${status || res.status})`);
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
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }

  // Derived KPIs and sophisticated insight from preview
  const revs = result?.reviews as any[] || [];
  const avgVal = revs.length ? revs.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0) / revs.length : 4.3;
  const avgDisplay = avgVal.toFixed(1);
  const totalDisplay = result?.place?.totalReviews as number ?? (revs.length || 12482);
  const positivePct = revs.length ? Math.round(revs.filter((r: any) => Number(r.rating) >= 4).length / revs.length * 100) : 72;

  // Enhanced insight generation from actual review content
  let insight = "Standardize breakfast quality";
  let badge = "Medium impact";
  if (revs.length > 0) {
    const textBlob = revs.map((r: any) => String(r.text || "")).join(" ").toLowerCase();
    const negativeRevs = revs.filter((r: any) => Number(r.rating) <= 3);
    const lowRatingCount = negativeRevs.length;

    // Check-in issues analysis
    const checkinKeywords = ['check-in', 'check in', 'checkin', 'reception', 'front desk', 'lobby', 'waiting', 'queue'];
    const checkinMentions = checkinKeywords.filter(keyword => textBlob.includes(keyword)).length;
    const checkinNegative = negativeRevs.some(r => checkinKeywords.some(kw => (r.text || "").toLowerCase().includes(kw)));

    // Wi-Fi issues analysis  
    const wifiKeywords = ['wifi', 'wi-fi', 'wi fi', 'internet', 'connection', 'network'];
    const wifiMentions = wifiKeywords.filter(keyword => textBlob.includes(keyword)).length;
    const wifiNegative = negativeRevs.some(r => wifiKeywords.some(kw => (r.text || "").toLowerCase().includes(kw)));

    // Cleanliness issues analysis
    const cleanKeywords = ['clean', 'dirty', 'dust', 'stain', 'smell', 'mold', 'bathroom', 'housekeeping'];
    const cleanMentions = cleanKeywords.filter(keyword => textBlob.includes(keyword)).length;
    const cleanNegative = negativeRevs.some(r => cleanKeywords.some(kw => (r.text || "").toLowerCase().includes(kw)));

    // Service issues analysis
    const serviceKeywords = ['service', 'staff', 'rude', 'helpful', 'friendly', 'attitude'];
    const serviceMentions = serviceKeywords.filter(keyword => textBlob.includes(keyword)).length;
    const serviceNegative = negativeRevs.some(r => serviceKeywords.some(kw => (r.text || "").toLowerCase().includes(kw)));

    // Prioritize insights based on frequency and negative sentiment
    if (checkinMentions >= 2 && checkinNegative) {
      insight = "Improve check‑in speed";
      badge = "High impact";
    } else if (wifiMentions >= 2 && wifiNegative) {
      insight = "Upgrade Wi‑Fi reliability";
      badge = "High impact";
    } else if (cleanMentions >= 2 && cleanNegative) {
      insight = "Deepen housekeeping checks";
      badge = "Medium impact";
    } else if (serviceMentions >= 2 && serviceNegative) {
      insight = "Enhance staff training";
      badge = "High impact";
    } else if (textBlob.includes('breakfast') || textBlob.includes('food')) {
      const foodNegative = negativeRevs.some(r => ['breakfast', 'food', 'buffet', 'dining'].some(kw => (r.text || "").toLowerCase().includes(kw)));
      if (foodNegative) {
        insight = "Improve breakfast quality";
        badge = "Medium impact";
      }
    } else if (lowRatingCount > 0) {
      // Fallback to most common complaint theme
      insight = "Address guest satisfaction";
      badge = lowRatingCount >= 2 ? "High impact" : "Medium impact";
    }
  }

  // Simple count-up on reveal
  function CountUp({
    value,
    duration = 800,
    decimals = 0
  }: {
    value: number;
    duration?: number;
    decimals?: number;
  }) {
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
  return <main className="relative min-h-screen overflow-hidden bg-gpt5-gradient animate-gpt5-pan font-sans">
      {/* subtle noise overlay */}
      <div className="pointer-events-none absolute inset-0 noise-overlay" aria-hidden="true" />

      {/* Navigation - Mobile vs Desktop */}
      {isMobile ? (/* Mobile: Hamburger menu in top-right */
    <div className="fixed right-4 top-4 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-card/95 backdrop-blur-xl border-l border-white/20">
              <div className="flex flex-col gap-6 pt-8">
                <div className="space-y-4">
                  <a href="/#docs" className="block rounded-lg px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
                    Docs
                  </a>
                  <a href="/#pricing" className="block rounded-lg px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
                    Pricing
                  </a>
                </div>
                <div className="border-t border-white/10 pt-6 space-y-3">
                  {authLoading ? <Button variant="ghost" className="w-full justify-start" disabled>
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Loading...
                    </Button> : session ? <Button variant="default" className="w-full" onClick={() => redirectToApp('/dashboard')}>
                      Go to Dashboard
                    </Button> : <>
                      <Button variant="default" className="w-full" onClick={() => document.dispatchEvent(new CustomEvent("waitlist:open"))}>
                        Join Waitlist
                      </Button>
                    </>}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>) : <>
          {/* Desktop: Top-right auth buttons */}
          <div className="fixed right-6 top-6 z-30">
            {authLoading ? <Button variant="ghost" className="rounded-full" disabled>
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              </Button> : session ? <Button id="btn-top-dashboard" variant="ghost" className="rounded-full" onClick={() => redirectToApp('/dashboard')}>
                Go to Dashboard
              </Button> : <Button id="btn-top-login" variant="ghost" className="rounded-full" onClick={() => document.dispatchEvent(new CustomEvent("waitlist:open"))}>
                Join Waitlist
              </Button>}
          </div>

          {/* Desktop: Glassmorphic centered nav - sleeker design */}
          <nav id="nav-glass" aria-label="Primary" className="pointer-events-auto fixed left-1/2 top-6 z-20 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-5 py-2.5 shadow-lg hover:bg-white/15 transition-all duration-300">
              <div className="h-2 w-2 rounded-full bg-black/60 flex-shrink-0" aria-hidden="true" />
              <div className="flex items-center gap-5 text-sm text-black/80">
                <a href="/#docs" className="rounded-full px-3 py-1.5 hover:text-black hover:bg-white/10 focus-ring transition-all duration-200 whitespace-nowrap">
                  Docs
                </a>
                <a href="/#pricing" className="rounded-full px-3 py-1.5 hover:text-black hover:bg-white/10 focus-ring transition-all duration-200 whitespace-nowrap">
                  Pricing
                </a>
              </div>
            </div>
          </nav>
        </>}

      {/* Centered Hero - Added top padding to push content below floating nav */}
      <section className="relative z-10 flex items-center justify-center min-h-screen pt-24">
        <div className="w-full max-w-[860px] px-6 flex flex-col justify-center items-center gap-6 text-center relative">
          {/* Padu logo */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-background/70 backdrop-blur-md shadow-lg animate-[float-y_4s_ease-in-out_infinite_alternate]">
            <img id="padu-logo" src="/lovable-uploads/10e2e94b-0e70-490d-bc29-2f836e6ddf32.png" alt="Padu logo – hotel review insights" className="h-12 w-12 rounded-xl object-contain" width={48} height={48} loading="eager" decoding="async" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Understand your guests with Padu.</h1>
          <p className="mt-3 text-lg text-muted-foreground">AI review consolidation & insights — one clear picture.</p>

        {/* Floating mini-cards rendered relative to search area below */}

          {/* Search capsule */}
          <div className="relative mx-auto mt-6 w-full max-w-[720px]">
            {/* Floating mini-cards positioned around the search */}

            <Input id="business-name-input" aria-label="Business name" aria-autocomplete="list" aria-controls="search-suggestions" aria-expanded={showSuggestions} aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined} placeholder="Start typing your hotel name…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => {
            if (e.key === "ArrowDown") {
              setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
              e.preventDefault();
            } else if (e.key === "ArrowUp") {
              setActiveIndex(i => Math.max(i - 1, 0));
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
          }} className="relative z-0 h-12 rounded-full px-5 pr-36 text-base shadow-inner focus-ring" />

            {loadingSuggest && <span className="pointer-events-none absolute right-28 top-1/2 -translate-y-1/2 text-muted-foreground">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" aria-hidden="true" />
                <span className="sr-only">Loading suggestions</span>
              </span>}

            <Button id="btn-preview-by-name" onClick={handlePreview} disabled={loading} aria-label="Preview" className="absolute right-1 top-1 h-10 rounded-full px-6" variant="hero">
              {loading ? <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                  Previewing…
                </span> : "Preview"}
            </Button>

            {/* Suggestions dropdown */}
            {showSuggestions && <div id="search-suggestions" role="listbox" className="absolute top-full mt-2 left-0 z-20 w-full max-h-80 overflow-auto rounded-xl border bg-card/90 backdrop-blur p-1 shadow-lg">
                {suggestions.length === 0 ? <div className="px-4 py-3 text-sm text-muted-foreground">No matches. Try adding city or address.</div> : suggestions.map((s, i) => {
              const active = i === activeIndex;
              const optionId = `suggestion-${i}`;
              return <button key={s.place_id} id={optionId} role="option" aria-selected={active} data-idx={i} onMouseEnter={() => setActiveIndex(i)} onMouseDown={e => e.preventDefault()} onClick={() => chooseSuggestion(s)} className={`w-full rounded-md px-4 py-3 text-left ${active ? "bg-accent/20" : "hover:bg-muted"}`}>
                        <div className="font-medium">{s.main_text || s.description}</div>
                        {s.secondary_text && <div className="text-xs text-muted-foreground">{s.secondary_text}</div>}
                      </button>;
            })}
              </div>}
          </div>

          <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-muted-foreground">We’ll instantly pull your last 5 Google reviews — no signup needed.</p>

          {/* Hero Cards - 3 cinematic cards */}
          <div className="mx-auto mt-12 grid w-full max-w-[900px] grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1: Average Guest Rating */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] animate-[fade-in_0.8s_ease-out_0.2s_both]" role="status" aria-label={result ? `Average rating ${avgDisplay}, total reviews ${totalDisplay}` : "Average guest rating preview"}>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star, idx) => <Star key={star} className={`h-4 w-4 transition-all duration-300 ${result ? star <= Math.floor(Number(avgDisplay)) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30" : "text-yellow-400 fill-yellow-400"}`} style={{
                    animationDelay: `${idx * 100}ms`
                  }} />)}
                  </div>
                  <span className="text-2xl font-bold">
                    {result ? <CountUp value={Number(avgDisplay)} decimals={1} /> : "4.3"}
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {result ? "Your actual rating" : "Your reputation at a glance"}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {result ? `${totalDisplay} total reviews` : "Last 90 days across Google, Tripadvisor & Booking.com"}
                </div>
              </div>
            </div>

            {/* Card 2: Impact on Bookings */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] animate-[fade-in_0.8s_ease-out_0.4s_both]" role="status" aria-label={result ? `${positivePct}% positive reviews` : "Impact on bookings preview"}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  <span className="text-2xl font-bold text-green-400">
                    {result ? <CountUp value={positivePct} /> : "72"}%
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {result ? "Positive review rate" : "of guests cite service quality as the deciding factor"}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {result ? "Reviews rating 4+ stars" : "Positive reviews directly drive bookings"}
                </div>
              </div>
            </div>

            {/* Card 3: Top Guest Insight */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] animate-[fade-in_0.8s_ease-out_0.6s_both]" role="status" aria-label={result ? `Top insight: ${insight}` : "Top guest insight preview"}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-950">
                    {result ? badge : "Medium impact"}
                  </span>
                </div>
                <div className="text-sm font-medium text-black">
                  {result ? insight : "Standardize breakfast quality"}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {result ? "AI-identified from recent reviews" : "A recurring theme with medium impact"}
                </div>
              </div>
            </div>
          </div>

          {/* Trust element */}
          <div className="mx-auto mt-8 text-center">
            <p className="text-xs text-muted-foreground/80 flex items-center justify-center gap-3">
              <span>Data pulled directly from</span>
              <img src="/logos/google.svg" alt="Google" className="h-3 opacity-60" />
              <img src="/logos/tripadvisor.svg" alt="Tripadvisor" className="h-3 opacity-60" />
              <img src="/logos/booking.svg" alt="Booking.com" className="h-3 opacity-60" />
            </p>
          </div>
        </div>
      </section>

      {/* Review Results Section */}
      <section className="relative z-10 pb-20">
        <div id="preview-results" aria-live="polite" className="mx-auto w-full max-w-[760px] px-6">
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            {result && <div className="animate-fade-in rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_24px_80px_rgba(0,0,0,0.12)] p-6">
                {/* Hotel Header with Logo */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-white/80 flex items-center justify-center">
                    {result.place?.icon || result.place?.photo ? <img src={result.place?.icon || result.place?.photo} alt={`${result.place?.name} logo`} className="w-12 h-12 object-contain" /> : <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {(result.place?.name || "H").charAt(0).toUpperCase()}
                      </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-foreground mb-1">{result.place?.name ?? "Unnamed place"}</h3>
                    <p className="text-sm text-muted-foreground">{result.place?.address ?? ""}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-4 w-4 ${star <= Math.floor(result.place?.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />)}
                      </div>
                      <span className="font-semibold text-foreground">{result.place?.rating ?? "-"}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground font-medium">{result.place?.totalReviews ?? 0} reviews</span>
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="space-y-4">
                  {(result.reviews || []).slice(0, 5).map((r: any, i: number) => <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {r.profile_photo_url ? <AvatarImage src={r.profile_photo_url} alt={`${r.author_name || "Reviewer"} avatar`} /> : <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {(r.author_name || "").slice(0, 2).toUpperCase() || "G"}
                          </AvatarFallback>}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-sm font-medium max-w-[200px]">{r.author_name || "Anonymous"}</div>
                          <div className="inline-flex items-center gap-1 text-yellow-400">
                            {Array.from({
                      length: Number(r.rating || 0)
                    }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-current" />)}
                          </div>
                          <span className="text-xs text-muted-foreground">{r.relative_time_description || ""}</span>
                        </div>
                        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{r.text || ""}</p>
                      </div>
                    </div>)}
                  
                  {(result.reviews || []).length > 5 && <div className="text-center pt-2">
                      <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                        See more reviews →
                      </button>
                    </div>}
                </div>

                <div className="mt-6 border-t border-white/10 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                     <Button id="btn-save-preview" onClick={handleSave} disabled={saving} aria-label="Save to dashboard (free)" className="rounded-full" variant="hero">
                       {saving ? <span className="inline-flex items-center gap-2">
                           <span className="h-4 w-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                           Saving…
                         </span> : user ? "Save to dashboard" : "Save to dashboard (free)"}
                     </Button>
                    
                  </div>
                </div>
              </div>}
        </div>
      </section>
    </main>;
}