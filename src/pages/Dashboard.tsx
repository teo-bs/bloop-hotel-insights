import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/stores/reviews";
import { useGlobalDateFilter } from "@/stores/filters";
import { filterReviews, calcAvgRating, calcTotals, calcTopTopic } from "@/lib/metrics";
import { generateInsights } from "@/lib/insights";
import TopInsightsModal from "@/components/dashboard/modals/TopInsightsModal";
import ForYouTodayModal from "@/components/dashboard/modals/ForYouTodayModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  Users, 
  TrendingUp, 
  Lightbulb,
  Calendar,
  Filter,
  ExternalLink,
  Download,
  Share2,
  FileText,
  AlertTriangle,
  Link as LinkIcon,
  CheckSquare,
  Clock,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, AreaChart, Area } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Dashboard() {
  const { user } = useAuth();
  const reviews = useReviews();
  const { start, end } = useGlobalDateFilter();
  
  
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    avgRating: 0,
    totalReviews: 0,
    pctPositive: 0,
    topTopic: "—"
  });
  const [insights, setInsights] = useState<any[]>([]);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [chartTab, setChartTab] = useState("trend");
  const [reviewSentimentFilter, setReviewSentimentFilter] = useState("all");
  const [reviewSourceFilter, setReviewSourceFilter] = useState("all");

  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || "User";
  const hotelName = "Grand Hotel Downtown";

  // Compute metrics
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const window = { from: start, to: end };
      const filtered = filterReviews(reviews as any, window, {});
      
      setMetrics({
        avgRating: calcAvgRating(filtered),
        totalReviews: calcTotals(filtered).total,
        pctPositive: calcTotals(filtered).positivePct,
        topTopic: calcTopTopic(filtered)
      });

      // Generate insights
      const allInsights = generateInsights(filtered as any);
      const weight: Record<any, number> = { High: 3, Medium: 2, Low: 1 };
      const topInsights = allInsights
        .sort((a, b) => (weight[b.impact] - weight[a.impact]) || (b.evidence.mentions - a.evidence.mentions))
        .slice(0, 3)
        .map(insight => ({
          id: insight.id,
          title: insight.title,
          impact: insight.impact,
          description: insight.recommendation,
          trend: `Mentions increased ${Math.floor(Math.random() * 30 + 10)}% vs last month`,
          actionable: true
        }));
      
      setInsights(topInsights);
      setIsLoading(false);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [reviews, start, end, refreshNonce]);

  // Mock data for charts
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
      { source: "Google Business", share: 45, color: "#4285F4" },
      { source: "TripAdvisor", share: 32, color: "#00AA6C" },
      { source: "Booking.com", share: 23, color: "#003580" },
    ]
  };

  const mockTasks = [
    {
      id: "1",
      title: "New negative reviews to triage",
      description: "Recent negative feedback needs your attention",
      type: "review" as const,
      priority: "high" as const,
      count: 3,
      ctaText: "Review now",
      ctaAction: () => console.log("Review negative feedback")
    },
    {
      id: "2", 
      title: "Integration pending",
      description: "Connect Google Business Profile to sync latest reviews",
      type: "integration" as const,
      priority: "medium" as const,
      lastAction: "Setup started 2 days ago",
      ctaText: "Connect",
      ctaAction: () => console.log("Connect integration")
    },
    {
      id: "3",
      title: "Export monthly report",
      description: "Generate January performance summary for stakeholders",
      type: "report" as const,
      priority: "low" as const,
      lastAction: "Last run: not yet",
      ctaText: "Generate",
      ctaAction: () => console.log("Generate report")
    }
  ];

  const mockReviews = [
    {
      id: "1",
      author: "Sarah Johnson",
      rating: 5,
      source: "google" as const,
      date: "2 hours ago",
      snippet: "Absolutely wonderful stay! The staff was incredibly helpful and the breakfast was outstanding. Will definitely come back!",
      sentiment: "positive" as const,
      platform_logo: "/logos/google.svg"
    },
    {
      id: "2", 
      author: "Mike Chen",
      rating: 4,
      source: "tripadvisor" as const,
      date: "5 hours ago", 
      snippet: "Great location and clean rooms. The only issue was the WiFi connectivity in our room on the 3rd floor.",
      sentiment: "positive" as const,
      platform_logo: "/logos/tripadvisor.svg"
    },
    {
      id: "3",
      author: "Emma Davis",
      rating: 2,
      source: "booking" as const,
      date: "1 day ago",
      snippet: "Disappointed with the room cleanliness. Found hair in the bathroom and the sheets didn't seem fresh.",
      sentiment: "negative" as const,
      platform_logo: "/logos/booking.svg"
    }
  ];

  // SEO
  useEffect(() => {
    document.title = `Dashboard - ${hotelName} | Padu`;
  }, [hotelName]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
        }`}
      />
    ));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "text-red-700 bg-red-50 border-red-200";
      case "Medium": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "Low": return "text-blue-700 bg-blue-50 border-blue-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "review": return AlertTriangle;
      case "integration": return LinkIcon;
      case "report": return FileText;
      default: return CheckSquare;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-700 bg-red-50 border-red-200";
      case "medium": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "low": return "text-blue-700 bg-blue-50 border-blue-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const sourceColors = {
    google: "bg-blue-50 text-blue-700",
    tripadvisor: "bg-green-50 text-green-700", 
    booking: "bg-purple-50 text-purple-700"
  };

  const sentimentColors = {
    positive: "bg-green-50 text-green-700 border-green-200",
    neutral: "bg-yellow-50 text-yellow-700 border-yellow-200",
    negative: "bg-red-50 text-red-700 border-red-200"
  };

  const filteredReviews = mockReviews.filter(review => {
    if (reviewSentimentFilter !== "all" && review.sentiment !== reviewSentimentFilter) return false;
    if (reviewSourceFilter !== "all" && review.source !== reviewSourceFilter) return false;
    return true;
  });

  const periods = [
    { value: "30d", label: "30d" },
    { value: "90d", label: "90d" },
    { value: "6mo", label: "6mo" },
    { value: "12mo", label: "12mo" },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 xl:px-8 py-4 md:py-8 space-y-6 md:space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Hi {firstName}, here's how <span className="hidden sm:inline">{hotelName}</span><span className="sm:hidden">your hotel</span> is performing
            </h1>
          </div>
          
          <div className="flex items-center justify-end">
            <Select defaultValue="30" onValueChange={(v) => console.log("Date range:", v)}>
              <SelectTrigger className="w-36 sm:w-40 rounded-full border-slate-200/60 bg-white/70 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 180 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Avg Guest Rating */}
          <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
            <CardContent className="p-4 md:p-6 flex flex-col justify-between h-[120px] md:h-[140px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-700" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-slate-700">Avg Guest Rating</span>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 md:px-2 py-0.5 md:py-1 text-green-700 bg-green-50 border-green-200">
                  <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                  +0.2
                </Badge>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl md:text-3xl font-bold tracking-tight transition-all duration-300 ${
                  metrics.avgRating === 0 ? "text-slate-400" : "text-slate-900"
                }`}>
                  {metrics.avgRating > 0 ? metrics.avgRating.toFixed(1) : '—'}
                </div>
                <div className="text-xs text-slate-500">Across all platforms</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Reviews */}
          <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
            <CardContent className="p-4 md:p-6 flex flex-col justify-between h-[120px] md:h-[140px]">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-700" />
                </div>
                <span className="text-xs md:text-sm font-medium text-slate-700">Total Reviews</span>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl md:text-3xl font-bold tracking-tight transition-all duration-300 ${
                  metrics.totalReviews === 0 ? "text-slate-400" : "text-slate-900"
                }`}>
                  {metrics.totalReviews || '—'}
                </div>
                <div className="text-xs text-slate-500">Last 30 days</div>
              </div>
            </CardContent>
          </Card>

          {/* % Positive */}
          <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
            <CardContent className="p-4 md:p-6 flex flex-col justify-between h-[120px] md:h-[140px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-700" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-slate-700">% Positive</span>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 md:px-2 py-0.5 md:py-1 text-green-700 bg-green-50 border-green-200">
                  <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                  +5%
                </Badge>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl md:text-3xl font-bold tracking-tight transition-all duration-300 ${
                  metrics.pctPositive === 0 ? "text-slate-400" : "text-slate-900"
                }`}>
                  {metrics.pctPositive > 0 ? `${metrics.pctPositive.toFixed(0)}%` : '—'}
                </div>
                <div className="text-xs text-slate-500">Positive vs Neutral/Negative</div>
              </div>
            </CardContent>
          </Card>

          {/* Top Insight */}
          <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
            <CardContent className="p-4 md:p-6 flex flex-col justify-between h-[120px] md:h-[140px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-700" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-slate-700">Top Insight</span>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 md:px-2 py-0.5 md:py-1 text-yellow-700 bg-yellow-50 border-yellow-200">
                  Medium
                </Badge>
              </div>
              <div className="space-y-1">
                <div className={`text-base md:text-lg font-bold tracking-tight transition-all duration-300 ${
                  metrics.topTopic === "—" ? "text-slate-400" : "text-slate-900"
                }`}>
                  {metrics.topTopic === "—" ? "No insights yet" : "Breakfast Quality"}
                </div>
                <div className="text-xs text-slate-500">Most mentioned theme</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart - Responsive */}
        <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
          <CardHeader className="pb-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold text-slate-900">Performance Evolution</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Track how your guest experience changes over time</p>
              </div>
              <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2">
                {periods.map((period) => (
                  <Button
                    key={period.value}
                    variant={selectedPeriod === period.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period.value)}
                    className="rounded-full text-xs flex-shrink-0"
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <Tabs value={chartTab} onValueChange={setChartTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
                <TabsTrigger value="trend" className="text-xs md:text-sm">Trend</TabsTrigger>
                <TabsTrigger value="sentiment" className="text-xs md:text-sm">Sentiment</TabsTrigger>
                <TabsTrigger value="sources" className="text-xs md:text-sm">Sources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="trend" className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,6,23,0.06)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      tickLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748B', fontSize: 11 }}
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
              
              <TabsContent value="sentiment" className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.sentiment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,6,23,0.06)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      tickLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748B', fontSize: 11 }}
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
              
              <TabsContent value="sources" className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.sources}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,6,23,0.06)" />
                    <XAxis 
                      dataKey="source" 
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      tickLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748B', fontSize: 11 }}
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
                    <Bar 
                      dataKey="share" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Two Column Layout - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Top Insights Modal */}
          <div className="lg:col-span-2">
            <TopInsightsModal insights={insights} isLoading={isLoading} />
          </div>
          
          {/* Right Column - For You Today Modal */}
          <div>
            <ForYouTodayModal tasks={mockTasks} />
          </div>
        </div>

        {/* Padu AI Card - Responsive */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-[0_12px_48px_rgba(147,51,234,0.15)] hover:shadow-[0_16px_64px_rgba(147,51,234,0.25)] transition-all duration-300 rounded-2xl relative overflow-hidden">
          {/* Subtle animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 animate-pulse" />
          
          <CardContent className="p-6 md:p-8 relative z-10 flex flex-col items-center text-center space-y-4 md:space-y-6 min-h-[180px] md:min-h-[200px] justify-center">
            {/* Enhanced Icon */}
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 blur-lg -z-10" />
            </div>
            
            {/* Enhanced Content */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Padu AI
                </h3>
                <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 animate-bounce text-xs">
                  Coming Soon
                </Badge>
              </div>
              
              <p className="text-purple-700 font-medium text-sm md:text-base">
                Your AI agents are almost here
              </p>
              
              <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                Intelligent AI agents will automatically analyze your reviews, generate insights, and suggest actionable improvements.
              </p>
            </div>
            
            {/* Preview Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl text-xs">
              <div className="flex items-center gap-2 text-purple-600 bg-white/50 rounded-lg p-2 md:p-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                <span>Smart review analysis</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600 bg-white/50 rounded-lg p-2 md:p-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                <span>Automated insights</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600 bg-white/50 rounded-lg p-2 md:p-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                <span>Action recommendations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Feed - Fixed */}
        <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
          <CardHeader className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Latest Reviews</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Recent guest feedback from all platforms</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={reviewSentimentFilter} onValueChange={setReviewSentimentFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={reviewSourceFilter} onValueChange={setReviewSourceFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sources</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                    <SelectItem value="booking">Booking.com</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm" className="rounded-full">
                  <Filter className="w-4 h-4 mr-2" />
                  More filters
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 pt-0">
            {filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.slice(0, 6).map((review, index) => (
                  <div 
                    key={review.id} 
                    className="p-4 rounded-xl bg-white/60 border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-slate-200 text-slate-600 text-sm font-semibold">
                          {review.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-900">{review.author}</span>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <Badge variant="outline" className={`text-xs px-2 py-1 ${sourceColors[review.source]}`}>
                              {review.source.charAt(0).toUpperCase() + review.source.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-1 ${sentimentColors[review.sentiment]}`}
                            >
                              {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                            </Badge>
                            <span className="text-xs text-slate-500">{review.date}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-700 leading-relaxed">{review.snippet}</p>
                        
                        <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-700 p-0 h-auto">
                          View full review
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 text-center">
                  <Button variant="outline" className="rounded-full">
                    Open full Reviews
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">No reviews in this range yet</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Try expanding your filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reports Card - Fixed */}
        <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-700" />
              </div>
              Reports
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              One-click, board-ready reports — branded with your hotel
            </p>
          </CardHeader>
          
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-200 hover:scale-105">
                  <Download className="w-4 h-4" />
                  Download PDF report
                </Button>
                
                <Button variant="outline" className="flex items-center justify-center gap-2 h-12 rounded-xl border-slate-200/60 hover:bg-slate-50/80 font-medium transition-all duration-200 hover:scale-105">
                  <Share2 className="w-4 h-4" />
                  Share link with team
                </Button>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">Last generated:</span>
                  <span className="font-medium text-slate-900">Never</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Monthly reports are automatically generated on the 1st of each month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }