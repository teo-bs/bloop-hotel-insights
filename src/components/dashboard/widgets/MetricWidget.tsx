import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Users, TrendingUp, Lightbulb, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const iconMap = {
  star: Star,
  users: Users,
  'trending-up': TrendingUp,
  lightbulb: Lightbulb,
};

interface MetricWidgetProps {
  data: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: keyof typeof iconMap;
    trend?: {
      value: number;
      direction: 'up' | 'down';
    };
    isEmpty?: boolean;
  };
}

function MetricWidget({ data }: MetricWidgetProps) {
  const Icon = iconMap[data.icon];
  
  return (
    <div className="w-full h-full">
      <Card className="w-full h-full bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
        <CardContent className="p-6 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Icon className="w-4 h-4 text-slate-700" />
              </div>
              <span className="text-sm font-medium text-slate-700">{data.title}</span>
            </div>
            
            {data.trend && (
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${
                  data.trend.direction === "up" 
                    ? "text-green-700 bg-green-50 border-green-200" 
                    : "text-red-700 bg-red-50 border-red-200"
                }`}
              >
                {data.trend.direction === "up" ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {data.trend.direction === "up" ? "+" : ""}{data.trend.value}
              </Badge>
            )}
          </div>

          {/* Value */}
          <div className="space-y-1">
            <div 
              className={`text-3xl font-bold tracking-tight transition-all duration-300 ${
                data.isEmpty ? "text-slate-400" : "text-slate-900"
              }`}
            >
              {data.value}
            </div>
            <div className="text-xs text-slate-500">{data.subtitle}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(MetricWidget);