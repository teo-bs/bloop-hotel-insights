import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area, BarChart, Bar } from 'recharts';

interface ChartWidgetProps {
  data: {
    title: string;
    subtitle: string;
  };
}

const chartData = {
  trend: [
    { date: "Jan 1", rating: 4.1, volume: 45 },
    { date: "Jan 8", rating: 4.2, volume: 52 },
    { date: "Jan 15", rating: 4.3, volume: 48 },
    { date: "Jan 22", rating: 4.1, volume: 41 },
    { date: "Jan 29", rating: 4.4, volume: 58 },
  ],
  sentiment: [
    { date: "Week 1", positive: 72, neutral: 18, negative: 10 },
    { date: "Week 2", positive: 68, neutral: 22, negative: 10 },
    { date: "Week 3", positive: 75, neutral: 15, negative: 10 },
    { date: "Week 4", positive: 71, neutral: 19, negative: 10 },
  ],
  sources: [
    { source: "Google", share: 45 },
    { source: "TripAdvisor", share: 32 },
    { source: "Booking", share: 23 },
  ]
};

function ChartWidget({ data }: ChartWidgetProps) {
  const [activeTab, setActiveTab] = useState("trend");
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const periods = [
    { value: "30d", label: "30d" },
    { value: "90d", label: "90d" },
    { value: "6mo", label: "6mo" },
  ];

  return (
    <div className="w-full h-full">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <Card className="w-full h-full bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">{data.title}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{data.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {periods.map((period) => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.value)}
                  className="rounded-lg text-xs h-8 px-3"
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="h-[calc(100%-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-slate-100">
              <TabsTrigger value="trend" className="text-xs">Rating</TabsTrigger>
              <TabsTrigger value="sentiment" className="text-xs">Sentiment</TabsTrigger>
              <TabsTrigger value="sources" className="text-xs">Sources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trend" className="h-[calc(100%-50px)]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[3.8, 4.6]}
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: 'none', 
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(16px)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="sentiment" className="h-[calc(100%-50px)]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.sentiment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: 'none', 
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(16px)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="positive" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="neutral" 
                    stackId="1" 
                    stroke="#6b7280" 
                    fill="#6b7280" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="negative" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="sources" className="h-[calc(100%-50px)]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.sources}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="source" 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: 'none', 
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(16px)'
                    }}
                  />
                  <Bar 
                    dataKey="share" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

export default memo(ChartWidget);