import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/stores/reviews";
import { useGlobalDateFilter } from "@/stores/filters";
import { filterReviews, calcAvgRating, calcTotals, calcTopTopic } from "@/lib/metrics";
import { generateInsights } from "@/lib/insights";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  
  const [activeTab, setActiveTab] = useState<"home" | "insights" | "competition" | "ai-agents">("home");
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
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="container mx-auto px-4 md:px-6 xl:px-8 py-8 space-y-8">
        {/* A) Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">
              Hi {firstName}, here's how {hotelName} is performing
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Select defaultValue="30" onValueChange={(v) => console.log("Date range:", v)}>
              <SelectTrigger className="w-40 rounded-full border-slate-200/60 bg-white/70">
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

        {/* B) KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Avg Guest Rating */}
          <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(2,6,23,0.12)] transition-all duration-300">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center justify-between text-slate-600 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  ⭐ Avg Guest Rating
                </div>
                <Badge variant="outline" className="text-xs px-2 py-1 text-green-700 bg-green-50 border-green-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +0.2 vs last period
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : metrics.avgRating > 0 ? (
                <div className="space-y-1">
                  <div className="text-4xl font-bold tracking-tight text-slate-900">
                    {metrics.avgRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500">Across Google, Tripadvisor & Booking.com</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-400">—</div>
                  <div className="text-xs text-slate-400">No rating yet — connect sources to see your score</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Reviews */}
          <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(2,6,23,0.12)] transition-all duration-300">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                <Users className="h-4 w-4" />
                🗣 Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ) : metrics.totalReviews > 0 ? (
                <div className="space-y-1">
                  <div className="text-4xl font-bold tracking-tight text-slate-900">
                    {metrics.totalReviews}
                  </div>
                  <div className="text-xs text-slate-500">Last 30 days</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-400">—</div>
                  <div className="text-xs text-slate-400">No reviews yet — try importing your history via CSV</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* % Positive */}
          <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(2,6,23,0.12)] transition-all duration-300">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center justify-between text-slate-600 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  📈 % Positive
                </div>
                <Badge variant="outline" className="text-xs px-2 py-1 text-green-700 bg-green-50 border-green-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% vs last month
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : metrics.pctPositive > 0 ? (
                <div className="space-y-1">
                  <div className="text-4xl font-bold tracking-tight text-slate-900">
                    {metrics.pctPositive.toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-500">Positive vs Neutral/Negative</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-400">—</div>
                  <div className="text-xs text-slate-400">We'll calculate sentiment as soon as reviews are synced</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Guest Insight */}
          <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(2,6,23,0.12)] transition-all duration-300">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center justify-between text-slate-600 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  💡 Top Guest Insight
                </div>
                <Badge variant="outline" className="text-xs px-2 py-1 text-yellow-700 bg-yellow-50 border-yellow-200">
                  Impact: Medium
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : insights.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-lg font-bold tracking-tight text-slate-900">
                    Standardize breakfast quality
                  </div>
                  <div className="text-xs text-slate-500">Based on recurring themes in recent reviews</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-lg font-bold text-slate-400">—</div>
                  <div className="text-xs text-slate-400">Insights will appear once we've analyzed your reviews</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* C) Performance Section */}
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
            <Tabs value={chartTab} onValueChange={setChartTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="trend" className="text-sm">Trend</TabsTrigger>
                <TabsTrigger value="sentiment" className="text-sm">Sentiment</TabsTrigger>
                <TabsTrigger value="sources" className="text-sm">Sources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="trend" className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.trend}>
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
                  <AreaChart data={chartData.sentiment}>
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
                  <BarChart data={chartData.sources}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,6,23,0.06)" />
                    <XAxis 
                      dataKey="source" 
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* D) Left Column - Insights */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  Top Insights this period
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : insights.length > 0 ? (
                insights.map((insight, index) => (
                  <Card 
                    key={insight.id} 
                    className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(2,6,23,0.12)] transition-all duration-300 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-slate-900 text-lg leading-tight">{insight.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-3 py-1 font-medium ${getImpactColor(insight.impact)}`}
                          >
                            Impact: {insight.impact}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs text-slate-400">
                            Based on recurring themes in recent reviews
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary-foreground hover:bg-primary rounded-full transition-all duration-200 group-hover:translate-x-1"
                          >
                            View details
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">No insights yet</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      We'll surface your most important guest themes as soon as we analyze incoming reviews.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* E) Right Column - For You Today */}
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  For you today
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Quick actions that keep your reputation sharp
                </p>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {mockTasks.length > 0 ? (
                mockTasks.map((task, index) => {
                  const Icon = getTaskIcon(task.type);
                  
                  return (
                    <Card 
                      key={task.id} 
                      className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(2,6,23,0.12)] transition-all duration-300 group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            task.priority === "high" ? "bg-red-100" :
                            task.priority === "medium" ? "bg-yellow-100" : "bg-blue-100"
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              task.priority === "high" ? "text-red-600" :
                              task.priority === "medium" ? "text-yellow-600" : "text-blue-600"
                            }`} />
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-slate-900">{task.title}</h3>
                                  {task.count && (
                                    <Badge variant="outline" className="text-xs px-2 py-1">
                                      {task.count} items
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                                {task.lastAction && (
                                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.lastAction}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-3 py-1 font-medium ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
                              </Badge>
                              
                              <Button 
                                size="sm" 
                                onClick={task.ctaAction}
                                className="rounded-full transition-all duration-200 group-hover:translate-x-1"
                              >
                                {task.ctaText}
                                <ArrowRight className="ml-2 h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <CheckSquare className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">All caught up!</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      You're all set for today. Check back later for new tasks and recommendations.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* F) Latest Reviews Feed */}
        <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
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
                    className="p-4 rounded-xl bg-white/50 border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200"
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

        {/* G) Reports Shortcut */}
        <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(2,6,23,0.12)] transition-all duration-300">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
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
    </DashboardLayout>
  );
}