import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { onSavePreviewGuard } from "@/lib/savePreview";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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
    } catch (e: any) {
      setError(e?.message || "Failed to fetch preview. Please try again.");
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-gpt5-gradient animate-gpt5-pan font-sans">
      {/* subtle noise overlay */}
      <div className="pointer-events-none absolute inset-0 noise-overlay" aria-hidden="true" />

      {/* Glassmorphic centered nav */}
      <nav aria-label="Primary" className="pointer-events-auto fixed left-1/2 top-6 z-20 -translate-x-1/2">
        <div className="flex items-center gap-6 rounded-full border border-input bg-card/70 px-5 py-2 backdrop-blur-md shadow-lg">
          <div className="h-3 w-3 rounded-full bg-foreground/50" aria-hidden="true" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="/#docs" className="rounded-full px-2 py-1 hover:text-foreground focus-ring">Docs</a>
            <a href="/#pricing" className="rounded-full px-2 py-1 hover:text-foreground focus-ring">Pricing</a>
            <Link to="/auth?mode=signin" className="rounded-full px-2 py-1 hover:text-foreground focus-ring">Login</Link>
          </div>
        </div>
      </nav>

      {/* Centered Hero */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-2xl text-center">
          {/* Padu logo */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-background/70 backdrop-blur-md shadow-lg">
            <svg id="padu-logo" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-label="Padu logo">
              <defs>
                <linearGradient id="padu-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
              <path d="M4 6a2 2 0 0 1 2-2h6.2a5.8 5.8 0 1 1 0 11.6H8v4.4H4V6Z" stroke="url(#padu-g)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Understand your guests with Padu.</h1>
          <p className="mt-3 text-base text-muted-foreground">AI review consolidation & insights — all in one place.</p>

          {/* Search capsule */}
          <div className="relative mx-auto mt-6 max-w-2xl">
            <Input
              id="business-name-input"
              aria-label="Business name"
              placeholder="Enter your business name to preview 5 recent Google reviews"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePreview(); }}
              className="h-12 rounded-full px-5 pr-36 text-base shadow-inner focus-ring"
            />
            <Button
              id="btn-preview-reviews"
              onClick={handlePreview}
              disabled={loading}
              aria-label="Preview reviews"
              className="absolute right-1 top-1 h-10 rounded-full px-6 hover:shadow-glow"
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
          </div>

          {/* Preview results */}
          <div id="preview-reviews-container" aria-live="polite" className="mx-auto mt-6 max-w-2xl text-left">
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

                <ul className="mt-4 space-y-4">
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

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-muted-foreground">Data from Google</div>
                  <Button
                    id="btn-save-reviews"
                    onClick={handleSave}
                    disabled={saving}
                    aria-label="Save to Dashboard"
                    className="rounded-full"
                    variant="hero"
                  >
                    {saving ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                        Saving…
                      </span>
                    ) : (
                      "Save to Dashboard"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
