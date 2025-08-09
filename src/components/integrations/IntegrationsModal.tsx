import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Eye, EyeOff } from "lucide-react";
import { useReviewSources, type Platform } from "@/stores/reviewSources";
import { connectSource, syncSource, syncAllSources } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface ConnectorMeta {
  platform: Platform;
  name: string;
  logo: string; // public path
  blurb: string;
}

const CONNECTORS: ConnectorMeta[] = [
  {
    platform: "google",
    name: "Google",
    logo: "/logos/google.svg",
    blurb: "Connect your Google Business Profile reviews.",
  },
  {
    platform: "tripadvisor",
    name: "Tripadvisor",
    logo: "/logos/tripadvisor.svg",
    blurb: "Bring in Tripadvisor feedback and ratings.",
  },
  {
    platform: "booking",
    name: "Booking.com",
    logo: "/logos/booking.svg",
    blurb: "Sync Booking.com guest reviews.",
  },
];

function StatusChip({ platform }: { platform: Platform }) {
  const sources = useReviewSources();
  const s = sources[platform];
  const variant = s.status === "connected" ? "secondary" : s.status === "error" ? "destructive" : "outline";
  const label = s.status === "connected" ? "Connected" : s.status === "error" ? "Error" : "Not connected";
  return (
    <Badge
      id={`chip-${platform}`}
      variant={variant as any}
      role="status"
      aria-live="polite"
      className="text-xs"
    >
      {label}
    </Badge>
  );
}

function ConnectorCard({ meta }: { meta: ConnectorMeta }) {
  const { platform, name, logo, blurb } = meta;
  const sources = useReviewSources();
  const s = sources[platform];
  const [showForm, setShowForm] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Close form after successful connect
    if (s.status === "connected") {
      setShowForm(false);
      setApiKey("");
      setError(null);
    }
  }, [s.status]);

  const lastSyncText = useMemo(() => {
    if (!s.lastSyncAt) return null;
    const diff = Date.now() - new Date(s.lastSyncAt).getTime();
    if (diff < 60_000) return "just now";
    const mins = Math.round(diff / 60_000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    return `${hrs}h ago`;
  }, [s.lastSyncAt]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await connectSource(platform, apiKey);
    } catch (e: any) {
      setError(e?.message || "Invalid key, try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleSyncNow() {
    setSyncing(true);
    try {
      await syncSource(platform);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Card id={`card-${platform}`} className="hover-scale">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt={`${name} logo`} className="h-8 w-8" loading="lazy" />
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>{blurb}</CardDescription>
          </div>
        </div>
        <StatusChip platform={platform} />
      </CardHeader>
      <CardContent className="space-y-3">
        {s.status === "connected" ? (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Last sync: <span className="font-medium">{lastSyncText ?? "just now"}</span>
            </div>
            <Button
              id={`btn-sync-${platform}`}
              size="sm"
              variant="secondary"
              onClick={handleSyncNow}
              aria-label={`Sync ${name} now`}
              disabled={syncing}
            >
              {syncing ? (
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/70 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/70 animate-pulse [animation-delay:120ms]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/70 animate-pulse [animation-delay:240ms]"></span>
                </span>
              ) : (
                "Sync now"
              )}
            </Button>
          </div>
        ) : null}

        {!showForm && s.status !== "connected" && (
          <Button
            id={`btn-connect-${platform}`}
            onClick={() => setShowForm(true)}
            aria-label={`Connect ${name}`}
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                Connecting...
              </span>
            ) : (
              "Connect"
            )}
          </Button>
        )}

        {showForm && s.status !== "connected" && (
          <div className="space-y-2">
            <label htmlFor={`input-api-${platform}`} className="text-sm font-medium">
              API Key
            </label>
            <div className="relative">
              <Input
                id={`input-api-${platform}`}
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key"
                aria-label={`${name} API Key`}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Use a placeholder key for MVP</p>
            {error ? (
              <p className="text-xs text-destructive" role="alert">{error}</p>
            ) : null}
            <div className="flex items-center gap-2 pt-2">
              <Button
                id={`btn-save-${platform}`}
                size="sm"
                onClick={handleSave}
                disabled={saving}
                aria-label={`Save ${name} API key`}
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                aria-label={`Cancel ${name} connection`}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function IntegrationsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-integrations-modal", onOpen as any);
    return () => window.removeEventListener("open-integrations-modal", onOpen as any);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent id="integrations-modal" className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle>Connect your review sources</DialogTitle>
              <DialogDescription>
                Choose a platform or import CSV to start analyzing.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button id="btn-sync-all" variant="secondary" size="sm" onClick={() => syncAllSources()} aria-label="Sync all sources">
                Sync all
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Help"
                    className="p-2 rounded-md hover:bg-muted"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  We recommend starting with CSV if you don’t have API keys
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </DialogHeader>
        <main>
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CONNECTORS.map((c) => (
                <ConnectorCard key={c.platform} meta={c} />
              ))}
            </div>
          </section>
        </main>
      </DialogContent>
    </Dialog>
  );
}
