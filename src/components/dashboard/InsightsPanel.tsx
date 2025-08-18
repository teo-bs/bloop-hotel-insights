import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Insight {
  id: string;
  title: string;
  impact: "High" | "Medium" | "Low";
  description: string;
  trend?: string;
  actionable: boolean;
}

interface InsightsPanelProps {
  insights: Insight[];
  isLoading?: boolean;
}

export default function InsightsPanel({ insights, isLoading }: InsightsPanelProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "text-red-700 bg-red-50 border-red-200";
      case "Medium": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "Low": return "text-blue-700 bg-blue-50 border-blue-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Insights List */}
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
                  
                  {insight.trend && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <TrendingUp className="w-4 h-4" />
                      <span>{insight.trend}</span>
                    </div>
                  )}
                  
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
  );
}