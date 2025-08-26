import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays } from "date-fns";
import { CalendarIcon, Star, TrendingUp, MessageSquare, Filter, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useReviewTotals, 
  useReviewAverage, 
  useReviewsByPlatform, 
  useReviewTimeSeries,
  type AnalyticsFilters 
} from "@/hooks/useReviewsAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

type DatePreset = "last_7" | "last_30" | "last_90" | "custom";

export default function ReviewsAnalyticsPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>("last_30");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const to = new Date();
    const from = subDays(to, 29);
    return { from, to };
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Prepare filters for analytics hooks
  const filters: AnalyticsFilters = {
    from: format(dateRange.from, 'yyyy-MM-dd'),
    to: format(dateRange.to, 'yyyy-MM-dd'),
    providers: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
  };

  // Analytics queries
  const { data: totals, isLoading: totalsLoading } = useReviewTotals(filters);
  const { data: average, isLoading: averageLoading } = useReviewAverage(filters);
  const { data: platformStats, isLoading: platformLoading } = useReviewsByPlatform(filters);
  const { data: timeSeries, isLoading: timeSeriesLoading } = useReviewTimeSeries(filters);

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    
    if (preset !== "custom") {
      const to = new Date();
      let from: Date;
      
      switch (preset) {
        case "last_7":
          from = subDays(to, 6);
          break;
        case "last_30":
          from = subDays(to, 29);
          break;
        case "last_90":
          from = subDays(to, 89);
          break;
        default:
          from = subDays(to, 29);
      }
      
      setDateRange({ from, to });
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  const platformOptions = [
    { value: 'google', label: 'Google', color: 'bg-blue-500' },
    { value: 'tripadvisor', label: 'TripAdvisor', color: 'bg-green-500' },
    { value: 'booking', label: 'Booking.com', color: 'bg-purple-500' }
  ];

  // Check if we have any data
  const hasData = totals && totals.total_reviews > 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 md:px-6 xl:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Reviews Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Monitor and analyze your review performance across platforms
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/upload'}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Reviews
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={datePreset} onValueChange={handleDatePresetChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7">Last 7 days</SelectItem>
                <SelectItem value="last_30">Last 30 days</SelectItem>
                <SelectItem value="last_90">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>

            {datePreset === "custom" && (
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-60 justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                        setShowDatePicker(false);
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}

            <div className="flex gap-2">
              {platformOptions.map(platform => (
                <Button
                  key={platform.value}
                  variant={selectedPlatforms.includes(platform.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlatformToggle(platform.value)}
                  className="flex items-center gap-2"
                >
                  <div className={cn("w-2 h-2 rounded-full", platform.color)} />
                  {platform.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          {!hasData ? (
            // Empty state
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by importing your first reviews or connecting a review platform.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.href = '/upload'}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV Reviews
                </Button>
                <Button variant="outline" disabled>
                  Connect Platform (Coming Soon)
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {totalsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-2xl font-bold">{totals?.total_reviews || 0}</div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      In selected time range
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {averageLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-2xl font-bold">
                        {average?.avg_rating ? average.avg_rating.toFixed(1) : "0.0"}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Across all platforms
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Trend</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">+12%</div>
                    <p className="text-xs text-muted-foreground">
                      vs previous period
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Breakdown</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Review distribution and ratings by platform
                  </p>
                </CardHeader>
                <CardContent>
                  {platformLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {platformStats?.map((platform) => {
                        const platformInfo = platformOptions.find(p => p.value === platform.platform);
                        return (
                          <div key={platform.platform} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-3 h-3 rounded-full", platformInfo?.color)} />
                              <span className="font-medium capitalize">{platform.platform}</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="font-medium">{platform.total}</div>
                                <div className="text-xs text-muted-foreground">reviews</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {platform.avg_rating.toFixed(1)}
                                </div>
                                <div className="text-xs text-muted-foreground">avg rating</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Time Series Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Trends</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Daily review volume and rating trends
                  </p>
                </CardHeader>
                <CardContent>
                  {timeSeriesLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : timeSeries && timeSeries.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeSeries}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="day" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                            formatter={(value, name) => [
                              value,
                              name === 'reviews' ? 'Reviews' : 'Avg Rating'
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="reviews"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="avg_rating"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            yAxisId="right"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No trend data available for selected period</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}