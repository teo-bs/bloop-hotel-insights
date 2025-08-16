import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  parseCsv,
  importReviews,
  emitReviewsUpdated,
  type ParsedCsvRow,
} from "@/lib/actions";
import { cn } from "@/lib/utils";

const REQUIRED_HEADERS = ["date", "platform", "rating", "text"] as const;
const OPTIONAL_HEADERS = ["title"] as const;
const VALID_PLATFORMS = new Set(["google", "tripadvisor", "booking"]);

interface Issue {
  row: number; // 1-indexed including header row -> show real CSV row numbers
  message: string;
}

export default function CSVUploadModal() {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedCsvRow[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [acceptedRows, setAcceptedRows] = useState<ParsedCsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-csv-modal", onOpen as any);
    return () => window.removeEventListener("open-csv-modal", onOpen as any);
  }, []);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setIsDragging(false);
      setFile(null);
      setHeaders([]);
      setRows([]);
      setIssues([]);
      setAcceptedRows([]);
      setImporting(false);
      setProgress(0);
      setSuccessCount(null);
    }
  }, [open]);

  const invalidCount = issues.length; // total found during validation (may be truncated visually)
  const invalidPercent = rows.length > 0 ? (invalidCount / rows.length) * 100 : 0;
  const canImport = !!file && rows.length > 0 && invalidPercent <= 2;

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) await handleFile(f);
  }

  async function handleBrowseClick() {
    inputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) await handleFile(f);
  }

  async function handleFile(f: File) {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a .csv file");
      return;
    }
    try {
      const { rows, headers } = await parseCsv(f);
      const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
      const missing = REQUIRED_HEADERS.filter((h) => !lowerHeaders.includes(h));
      if (missing.length) {
        toast.error(`CSV missing headers: ${missing.join(", ")}`);
        return;
      }
      setFile(f);
      setHeaders(lowerHeaders);
      setRows(rows);
      validateRows(rows);
    } catch (err) {
      console.error(err);
      toast.error("Failed to read CSV");
    }
  }

  function parseDateValid(s: string): boolean {
    if (!s) return false;
    const d = new Date(s);
    if (!isNaN(d.getTime())) return true;
    const m = s.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/);
    if (m) {
      const mm = Number(m[1]);
      const dd = Number(m[2]);
      const yyyy = Number(m[3]);
      const d2 = new Date(yyyy, mm - 1, dd);
      return d2.getFullYear() === yyyy && d2.getMonth() === mm - 1 && d2.getDate() === dd;
    }
    return false;
  }

  function validateRows(all: ParsedCsvRow[]) {
    const issuesAll: Issue[] = [];
    const accepted: ParsedCsvRow[] = [];
    all.forEach((r, idx) => {
      const rowNum = idx + 2; // account for header row
      const platform = String(r.platform || "").toLowerCase().trim();
      const ratingNum = Number(r.rating);
      const text = String(r.text || "").trim();
      const dateStr = String(r.date || "").trim();
      const rowIssues: string[] = [];

      if (!parseDateValid(dateStr)) rowIssues.push("Invalid date");
      if (!VALID_PLATFORMS.has(platform)) rowIssues.push("Invalid platform");
      if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) rowIssues.push("Invalid rating");
      if (text.length < 10) rowIssues.push("Text too short");

      if (rowIssues.length) {
        issuesAll.push({ row: rowNum, message: rowIssues.join(", ") });
      } else {
        accepted.push({ ...r, platform, rating: ratingNum, text, date: dateStr });
      }
    });

    setIssues(issuesAll);
    setAcceptedRows(accepted);
  }

  async function onImport() {
    if (!canImport) return;
    setImporting(true);
    setProgress(10);

    // Simulate indeterminate start then determinate
    const interval = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 5 : p));
    }, 200);

    try {
      const count = await importReviews(acceptedRows);
      setProgress(100);
      setSuccessCount(count);
      emitReviewsUpdated();
    } catch (e) {
      toast.error("Upload failed, please try again");
    } finally {
      clearInterval(interval);
      setImporting(false);
    }
  }

  const issuesToShow = useMemo(() => issues.slice(0, 10), [issues]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent id="csv-modal" className="max-w-3xl bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
        <DialogHeader>
          <DialogTitle>Upload reviews via CSV</DialogTitle>
          <DialogDescription>
            Use our template: date, platform, rating, text, [title optional]
          </DialogDescription>
        </DialogHeader>

        {successCount === null ? (
          <div className="space-y-4">
            <div
              id="csv-dropzone"
              className={cn(
                "border-2 border-dashed rounded-xl p-8 grid place-items-center text-center cursor-pointer",
                isDragging ? "bg-muted/50" : "bg-muted/30"
              )}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={handleBrowseClick}
              role="button"
              aria-label="Drop CSV here or browse"
            >
              <div className="flex flex-col items-center gap-3">
                <UploadCloud className="h-8 w-8 opacity-70" />
                <p className="text-sm">
                  <span className="font-medium">Drop CSV here</span> or browse
                </p>
              </div>
              <Input
                id="input-csv"
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            {file && (
              <div className="text-sm text-muted-foreground">
                Selected file: <span className="font-medium">{file.name}</span> — {rows.length} rows
                {rows.length > 0 && (
                  <span> • {Math.round(invalidPercent * 100) / 100}% invalid</span>
                )}
              </div>
            )}

            {issues.length > 0 && (
              <div id="csv-issues" aria-live="polite" className="rounded-lg border p-3">
                <div className="font-medium mb-1">Issues</div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {issuesToShow.map((iss, i) => (
                    <li key={i}>Row {iss.row}: {iss.message}</li>
                  ))}
                </ul>
                {issues.length > 10 && (
                  <div className="text-xs text-muted-foreground mt-1">Showing first 10 of {issues.length} issues</div>
                )}
              </div>
            )}

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <div className="text-xs text-muted-foreground">
                  Processing {rows.length} rows • Accepted so far: {acceptedRows.length}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <a id="link-sample-csv" href="/sample.csv" download className="text-sm underline">
                Download sample.csv
              </a>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)} aria-label="Cancel import">
                  Cancel
                </Button>
                <Button id="btn-import-csv" onClick={onImport} disabled={!canImport || importing} aria-label="Import CSV">
                  Import
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid place-items-center gap-3 py-8">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <div className="text-lg font-semibold">
              Imported <span id="import-count">{successCount}</span> reviews
            </div>
            <Button
              onClick={() => {
                setOpen(false);
                // Use hash for in-app navigation since we're already on app subdomain
                window.location.hash = "dashboard";
                window.location.href = "#metrics";
              }}
              aria-label="View in Dashboard"
            >
              View in Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
