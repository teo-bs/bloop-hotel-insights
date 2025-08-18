import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, AreaChart, Area } from "recharts";

interface PerformanceChartProps {
  data: {
    trend: Array<{ date: string; rating: number; volume: number }>;
    sentiment: Array<{ date: string; positive: number; neutral: number; negative: number }>;
    sources: Array<{ source: string; share: number; color: string }>;
  };
  isLoading?: boolean;
}

export default function PerformanceChart({ data, isLoading }: PerformanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("trend");

  const periods = [
    { value: "30d", label: "30d" },
    { value: "90d", label: "90d" },
    { value: "6mo", label: "6mo" },
    { value: "12mo", label: "12mo" },
  ];

  return (
    <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
      <CardHeader className="p-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Performance Evolution</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Track how your guest experience changes over time</p>
          </div>
          <div className="flex items-center gap-2">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
                className="rounded-full text-xs"
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="trend" className="text-sm">Trend</TabsTrigger>
            <TabsTrigger value="sentiment" className="text-sm">Sentiment</TabsTrigger>
            <TabsTrigger value="sources" className="text-sm">Sources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trend" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,6,23,0.06)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickLine={{ stroke: '#CBD5E1' }}
                  domain={[0, 5]}
                />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: '1px solid rgba(15,23,42,.08)', 
                    backgroundColor: 'white',
                    boxShadow: '0 12px 40px rgba(2,6,23,0.08)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="sentiment" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sentiment}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,6,23,0.06)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: '1px solid rgba(15,23,42,.08)', 
                    backgroundColor: 'white',
                    boxShadow: '0 12px 40px rgba(2,6,23,0.08)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="positive" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral" 
                  stackId="1" 
                  stroke="#6B7280" 
                  fill="#6B7280" 
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="negative" 
                  stackId="1" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="sources" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sources} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,6,23,0.06)" />
                <XAxis 
                  type="number" 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="source" 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickLine={{ stroke: '#CBD5E1' }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: '1px solid rgba(15,23,42,.08)', 
                    backgroundColor: 'white',
                    boxShadow: '0 12px 40px rgba(2,6,23,0.08)'
                  }}
                />
                <Bar 
                  dataKey="share" 
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}