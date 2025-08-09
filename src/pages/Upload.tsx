
import { useState } from "react";
import Papa from "papaparse";
import { unsafeSupabase } from "@/integrations/supabase/unsafe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

type CsvRow = {
  review_date?: string;
  rating?: string | number;
  rating_scale?: string | number;
  title?: string;
  text?: string;
  author?: string;
  language?: string;
  source?: string;
  external_id?: string;
  url?: string;
  hotel_name?: string;
  // Support a couple of common aliases (light pre-mapping)
  date?: string;
  content?: string;
  reviewer?: string;
};

function toNumber(v: string | number | undefined, fallback: number | null = null) {
  if (v === undefined || v === null || v === "") return fallback;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function toInt(v: string | number | undefined, fallback: number) {
  if (v === undefined || v === null || v === "") return fallback;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const parseCsv = (file: File): Promise<CsvRow[]> =>
    new Promise((resolve, reject) => {
      Papa.parse<CsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results) => {
          console.log("[Upload] parsed", results.data.length, "rows");
          resolve(results.data);
        },
        error: (err) => reject(err),
      });
    });

  const createBatch = async (total: number) => {
    const { data, error } = await unsafeSupabase
      .from("ingestion_batches")
      .insert([
        {
          user_id: user!.id,
          source_type: "csv",
          source_label: "CSV Upload",
          status: "processing",
          total_count: total,
          notes: "Uploaded via UI",
        },
      ])
      .select("id")
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error("Failed to create ingestion batch (no data returned)");
    }
    return data.id as string;
  };

  const updateBatch = async (batchId: string, fields: Record<string, any>) => {
    const { error } = await unsafeSupabase.from("ingestion_batches").update(fields).eq("id", batchId);
    if (error) throw error;
  };

  const insertReview = async (row: CsvRow, batchId: string) => {
    // Map fields with simple aliases
    const review_date = row.review_date || row.date || undefined;
    const parsedDate = review_date ? new Date(review_date).toISOString() : null;

    const payload = {
      user_id: user!.id,
      ingestion_batch_id: batchId,
      source_type: "csv",
      hotel_name: row.hotel_name ?? null,
      review_date: parsedDate,
      rating: toNumber(row.rating, null),
      rating_scale: toInt(row.rating_scale, 5),
      title: row.title ?? null,
      text: row.text || row.content || null,
      author: row.author || row.reviewer || null,
      language: row.language ?? null,
      source: row.source ?? "csv",
      external_id: row.external_id ?? null,
      url: row.url ?? null,
    };

    const res = await unsafeSupabase.from("reviews").insert([payload]);
    return res;
  };

  const handleUpload = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "Authentication is required.", variant: "destructive" });
      return;
    }
    if (!file) {
      toast({ title: "No file selected", description: "Choose a CSV file to continue." });
      return;
    }

    setProcessing(true);
    try {
      const rows = await parseCsv(file);
      if (!rows.length) {
        toast({ title: "Empty file", description: "No rows found in the CSV." });
        setProcessing(false);
        return;
      }

      const batchId = await createBatch(rows.length);
      let success = 0;
      let errors = 0;

      // Insert one by one to gracefully skip duplicates (unique index will protect)
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        // skip completely empty row objects
        if (Object.values(r).every((v) => v === undefined || v === null || v === "")) continue;

        const { error } = await insertReview(r, batchId);
        if (error) {
          // Unique violation (duplicate) -> count as error but continue
          console.warn("[Upload] insert error row", i, error);
          errors += 1;
        } else {
          success += 1;
        }

        if ((i + 1) % 500 === 0) {
          console.log(`[Upload] processed ${i + 1}/${rows.length}`);
        }
      }

      await updateBatch(batchId, {
        success_count: success,
        error_count: errors,
        status: "complete",
        completed_at: new Date().toISOString(),
      });

      // Refresh materialized view to make dashboard instant
      const { error: refreshError } = await unsafeSupabase.rpc("refresh_mv_metrics_daily");
      if (refreshError) {
        console.error("[Upload] refresh MV error", refreshError);
      }

      toast({
        title: "Upload completed",
        description: `Imported ${success} reviews, ${errors} skipped.`,
      });

      navigate("/dashboard");
    } catch (e: any) {
      console.error("[Upload] fatal error", e);
      toast({ title: "Upload failed", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-10 animate-fade-in">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload Reviews (CSV)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Expected headers: review_date,rating,rating_scale,title,text,author,language,source,external_id,url,hotel_name
            </p>
          </div>
          <Input type="file" accept=".csv,text/csv" onChange={onFileChange} />
          <Button onClick={handleUpload} variant="hero" disabled={!file || processing}>
            {processing ? "Processing..." : "Start upload"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
