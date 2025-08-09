
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { unsafeSupabase } from "@/integrations/supabase/unsafe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend,
} from "recharts";

type MetricsRow = {
  user_id: string;
  day: string; // date
  reviews_count: number;
  avg_rating: number | null;
  avg_norm_rating: number | null;
  pos_cnt: number;
  neu_cnt: number;
  neg_cnt: number;
};

function useLast90DaysRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 89); // inclusive 90 days
  const toStr = (d: Date) => d.toISOString().slice(0, 10);
  return { start, end, startStr: toStr(start), endStr: toStr(end) };
}

export default function Dashboard() {
  const { toast } = useToast();
  const { startStr, endStr } = useLast90DaysRange();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["mv_metrics_daily", startStr, endStr],
    queryFn: async () => {
      console.log("[Dashboard] fetching mv_metrics_daily", { startStr, endStr });
      const res = await unsafeSupabase
        .from("mv_metrics_daily")
        .select("*")
        .gte("day", startStr)
        .lte("day", endStr)
        .order("day", { ascending: true });

      if (res.error) {
        console.error("[Dashboard] query error", res.error);
        throw res.error;
      }
      return res.data as MetricsRow[];
    },
  });

  const handleRefreshMetrics = async () => {
    console.log("[Dashboard] refreshing materialized view");
    const { error } = await unsafeSupabase.rpc("refresh_mv_metrics_daily");
    if (error) {
      console.error("[Dashboard] refresh error", error);
      toast({ title: "Refresh failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Metrics refreshed", description: "Dashboard data updated." });
    refetch();
  };

  const chartData = useMemo(() => data ?? [], [data]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard (Last 90 Days)</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleRefreshMetrics}>Refresh metrics</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Rating (Normalized to 5)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
            <CardTitle>Review Volume by Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pos_cnt" stackId="a" fill="hsl(var(--chart-1))" name="Positive" />
                <Bar dataKey="neu_cnt" stackId="a" fill="hsl(var(--chart-2))" name="Neutral" />
                <Bar dataKey="neg_cnt" stackId="a" fill="hsl(var(--chart-3))" name="Negative" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">
            {isLoading ? "..." : (chartData.reduce((sum, r) => sum + (r.reviews_count ?? 0), 0))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
