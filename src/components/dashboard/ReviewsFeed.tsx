import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ExternalLink, Filter } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Review {
  id: string;
  author: string;
  rating: number;
  source: "google" | "tripadvisor" | "booking";
  date: string;
  snippet: string;
  sentiment: "positive" | "neutral" | "negative";
  platform_logo: string;
}

interface ReviewsFeedProps {
  reviews: Review[];
  isLoading?: boolean;
}

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

export default function ReviewsFeed({ reviews, isLoading }: ReviewsFeedProps) {
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");

  const filteredReviews = reviews.filter(review => {
    if (selectedSentiment !== "all" && review.sentiment !== selectedSentiment) return false;
    if (selectedSource !== "all" && review.source !== selectedSource) return false;
    return true;
  });

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

  return (
    <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
      <CardHeader className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Latest Reviews</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Recent guest feedback from all platforms</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
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
            
            <Select value={selectedSource} onValueChange={setSelectedSource}>
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
                View all reviews
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No reviews found</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              No reviews match your current filters. Try expanding your search criteria.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}