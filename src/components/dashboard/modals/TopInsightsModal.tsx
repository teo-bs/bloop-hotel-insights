import { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowRight } from "lucide-react";

interface TopInsightsModalProps {
  insights: Array<{
    id: string;
    title: string;
    impact: string;
    description: string;
  }>;
  isLoading: boolean;
}

export default memo(function TopInsightsModal({ insights, isLoading }: TopInsightsModalProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "text-red-700 bg-red-50 border-red-200";
      case "Medium": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "Low": return "text-blue-700 bg-blue-50 border-blue-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-pointer group">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Top Insights this period</h3>
                <p className="text-sm text-slate-600">
                  {insights.length > 0 ? `${insights.length} insights available` : "No insights yet"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            Top Insights this period
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {insights.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <Lightbulb className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No insights yet</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  We'll surface your most important guest themes as soon as we analyze incoming reviews.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="bg-white border border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-slate-900">{insight.title}</h4>
                      <Badge variant="outline" className={`text-xs px-3 py-1 ${getImpactColor(insight.impact)}`}>
                        {insight.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-4">{insight.description}</p>
                    <Button variant="outline" size="sm">
                      View details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});