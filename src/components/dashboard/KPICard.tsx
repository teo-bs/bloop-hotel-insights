import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: number;
    direction: "up" | "down";
    period: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  animation?: "count-up" | "stars" | "sparkline" | "pulse";
  emptyState?: string;
}

export default function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  isLoading, 
  animation = "count-up",
  emptyState 
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isLoading && value !== displayValue) {
      setIsAnimating(true);
      
      // Count up animation for numbers
      if (animation === "count-up" && typeof value === "number" && value > 0) {
        let start = 0;
        const duration = 1500;
        const increment = value / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= value) {
            setDisplayValue(value);
            clearInterval(timer);
            setIsAnimating(false);
          } else {
            setDisplayValue(Math.floor(start));
          }
        }, 16);
        
        return () => clearInterval(timer);
      } else {
        // Immediate update for non-numeric values
        setTimeout(() => {
          setDisplayValue(value);
          setIsAnimating(false);
        }, 300);
      }
    }
  }, [value, isLoading, animation, displayValue]);

  const isEmpty = !value || (typeof value === "number" && value === 0) || value === "—";

  return (
    <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(2,6,23,0.12)] transition-all duration-300 group">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="flex items-center justify-between text-slate-600 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </div>
          {trend && (
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-1 ${
                trend.direction === "up" 
                  ? "text-green-700 bg-green-50 border-green-200" 
                  : "text-red-700 bg-red-50 border-red-200"
              }`}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {trend.direction === "up" ? "+" : ""}{trend.value} vs {trend.period}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : isEmpty && emptyState ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-400">—</div>
            <div className="text-xs text-slate-400">{emptyState}</div>
          </div>
        ) : (
          <div className="space-y-1">
            <div 
              className={`text-4xl font-bold tracking-tight text-slate-900 transition-all duration-300 ${
                isAnimating ? "scale-105" : "scale-100"
              } ${animation === "pulse" ? "animate-pulse" : ""}`}
            >
              {typeof displayValue === "number" && title.includes("%") 
                ? `${displayValue.toFixed(0)}%`
                : typeof displayValue === "number" && title.includes("Rating")
                ? displayValue.toFixed(1)
                : displayValue
              }
            </div>
            <div className="text-xs text-slate-500">{subtitle}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}