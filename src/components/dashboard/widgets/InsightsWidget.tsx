import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface InsightsWidgetProps {
  data: {
    title: string;
    subtitle: string;
  };
}

const mockInsights = [
  {
    id: "1",
    title: "Breakfast consistency matters",
    impact: "High" as const,
    description: "Guests frequently mention breakfast quality variations. Standardizing preparation could improve ratings.",
  },
  {
    id: "2",
    title: "WiFi connectivity issues",
    impact: "Medium" as const,
    description: "Multiple reports of slow internet in rooms on floors 3-4. Technical review recommended.",
  },
  {
    id: "3",
    title: "Check-in process delays",
    impact: "Low" as const,
    description: "Average wait time has increased. Consider additional staff during peak hours.",
  }
];

function InsightsWidget({ data }: InsightsWidgetProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "text-red-700 bg-red-50 border-red-200";
      case "Medium": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "Low": return "text-blue-700 bg-blue-50 border-blue-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="w-full h-full">
      <Card className="w-full h-full bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-700" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 truncate">{data.title}</CardTitle>
              <p className="text-xs sm:text-sm text-slate-600 truncate">{data.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 sm:space-y-4 h-[calc(100%-100px)] sm:h-[calc(100%-120px)] overflow-y-auto">
          {mockInsights.map((insight, index) => (
            <div 
              key={insight.id} 
              className="p-3 sm:p-4 rounded-xl bg-white/60 border border-slate-100 hover:bg-white/80 transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight flex-1 min-w-0">{insight.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 font-medium flex-shrink-0 ${getImpactColor(insight.impact)}`}
                  >
                    {insight.impact}
                  </Badge>
                </div>
                
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{insight.description}</p>
                
                <div className="flex items-center justify-between pt-1 gap-2">
                  <div className="text-xs text-slate-400 flex-shrink-0">
                    Based on reviews
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg h-6 sm:h-7 px-1.5 sm:px-2 text-xs flex-shrink-0"
                  >
                    <span className="hidden sm:inline">View details</span>
                    <span className="sm:hidden">View</span>
                    <ArrowRight className="ml-0.5 sm:ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {mockInsights.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="h-6 w-6 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">No insights yet</h4>
              <p className="text-sm text-slate-600">
                We'll surface important themes as we analyze your reviews.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(InsightsWidget);