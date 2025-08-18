import { useEffect, useState } from "react";
import { Star, Users, TrendingUp, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/stores/reviews";
import { useGlobalDateFilter } from "@/stores/filters";
import { filterReviews, calcAvgRating, calcTotals, calcTopTopic } from "@/lib/metrics";
import { generateInsights } from "@/lib/insights";

import TopNavbar from "@/components/layout/TopNavbar";
import KPICard from "@/components/dashboard/KPICard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import TasksToday from "@/components/dashboard/TasksToday";
import ReviewsFeed from "@/components/dashboard/ReviewsFeed";
import ReportsCard from "@/components/dashboard/ReportsCard";

export default function NewDashboard() {
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

  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || "User";
  const hotelName = "Grand Hotel Downtown"; // This would come from user's hotel profile

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

  // Mock data for charts and components
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <TopNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 md:px-6 xl:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">
              Hi {firstName}, here's how {hotelName} is performing 👋
            </h1>
            <p className="text-slate-600">Track your guest experience and reputation metrics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 border border-slate-200/60 rounded-full bg-white/70 backdrop-blur-sm text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 180 days</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="⭐ Avg Guest Rating"
            value={metrics.avgRating || 0}
            subtitle="Across Google, Tripadvisor & Booking.com"
            trend={{ value: 0.2, direction: "up", period: "last period" }}
            icon={Star}
            isLoading={isLoading}
            animation="stars"
            emptyState="No rating yet — connect sources to see your score"
          />
          
          <KPICard
            title="🗣 Total Reviews"
            value={metrics.totalReviews || 0}
            subtitle="Last 30 days"
            icon={Users}
            isLoading={isLoading}
            animation="count-up"
            emptyState="No reviews yet — try importing your history via CSV"
          />
          
          <KPICard
            title="📈 % Positive"
            value={metrics.pctPositive || 0}
            subtitle="Positive vs Neutral/Negative"
            trend={{ value: 5, direction: "up", period: "last month" }}
            icon={TrendingUp}
            isLoading={isLoading}
            animation="count-up"
            emptyState="We'll calculate sentiment as soon as reviews are synced"
          />
          
          <KPICard
            title="💡 Top Guest Insight"
            value={metrics.topTopic === "—" ? "Standardize breakfast quality" : metrics.topTopic}
            subtitle="Based on recurring themes in recent reviews"
            icon={Lightbulb}
            isLoading={isLoading}
            animation="pulse"
            emptyState="Insights will appear once we've analyzed your reviews"
          />
        </div>

        {/* Performance Section */}
        <PerformanceChart data={chartData} isLoading={isLoading} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Insights */}
          <div className="lg:col-span-2">
            <InsightsPanel insights={insights} isLoading={isLoading} />
          </div>
          
          {/* Right Column - Tasks */}
          <div>
            <TasksToday tasks={mockTasks} />
          </div>
        </div>

        {/* Reviews Feed */}
        <ReviewsFeed reviews={mockReviews} isLoading={isLoading} />

        {/* Reports */}
        <ReportsCard />
      </main>
    </div>
  );
}