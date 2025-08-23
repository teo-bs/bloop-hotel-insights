import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Filter, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ReviewsWidgetProps {
  data: {
    title: string;
    subtitle: string;
  };
}

const mockReviews = [
  {
    id: "1",
    author: "Sarah Johnson",
    rating: 5,
    source: "google" as const,
    date: "2 hours ago",
    snippet: "Absolutely wonderful stay! The staff was incredibly helpful and the breakfast was outstanding.",
    sentiment: "positive" as const,
  },
  {
    id: "2", 
    author: "Mike Chen",
    rating: 4,
    source: "tripadvisor" as const,
    date: "5 hours ago", 
    snippet: "Great location and clean rooms. The only issue was the WiFi connectivity.",
    sentiment: "positive" as const,
  },
  {
    id: "3",
    author: "Emma Davis",
    rating: 2,
    source: "booking" as const,
    date: "1 day ago",
    snippet: "Disappointed with the room cleanliness. Found hair in the bathroom.",
    sentiment: "negative" as const,
  }
];

function ReviewsWidget({ data }: ReviewsWidgetProps) {
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
        }`}
      />
    ));
  };

  const filteredReviews = mockReviews.filter(review => {
    if (sentimentFilter !== "all" && review.sentiment !== sentimentFilter) return false;
    if (sourceFilter !== "all" && review.source !== sourceFilter) return false;
    return true;
  });

  return (
    <div className="w-full h-full">
      <Card className="w-full h-full bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 truncate">{data.title}</CardTitle>
              <p className="text-xs sm:text-sm text-slate-600 truncate">{data.subtitle}</p>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-20 sm:w-24 h-7 sm:h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-20 sm:w-24 h-7 sm:h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2 sm:space-y-3 h-[calc(100%-120px)] sm:h-[calc(100%-140px)] overflow-y-auto">
          {filteredReviews.length > 0 ? (
            <>
              {filteredReviews.map((review, index) => (
                <div 
                  key={review.id} 
                  className="p-2.5 sm:p-3 rounded-xl bg-white/60 border border-slate-100 hover:bg-white/80 transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                      <AvatarFallback className="bg-slate-200 text-slate-600 text-xs font-semibold">
                        {review.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <span className="font-medium text-slate-900 text-xs sm:text-sm truncate">{review.author}</span>
                          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                            {renderStars(review.rating)}
                          </div>
                          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 sm:px-2 ${sourceColors[review.source]} flex-shrink-0`}>
                            {review.source.charAt(0).toUpperCase() + review.source.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-1.5 py-0.5 sm:px-2 ${sentimentColors[review.sentiment]}`}
                          >
                            <span className="hidden sm:inline">
                              {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                            </span>
                            <span className="sm:hidden">
                              {review.sentiment.charAt(0).toUpperCase()}
                            </span>
                          </Badge>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{review.date}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed line-clamp-2">{review.snippet}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-2 text-center">
                <Button variant="outline" size="sm" className="rounded-lg h-7 sm:h-8 px-3 sm:px-4 text-xs">
                  <span className="hidden sm:inline">View all reviews</span>
                  <span className="sm:hidden">View all</span>
                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">No reviews found</h4>
              <p className="text-sm text-slate-600">
                Try adjusting your filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(ReviewsWidget);