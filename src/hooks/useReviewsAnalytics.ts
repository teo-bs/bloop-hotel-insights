import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AnalyticsFilters {
  from: string;
  to: string;
  providers?: string[];
}

export interface ReviewTotals {
  total_reviews: number;
}

export interface ReviewAverage {
  avg_rating: number;
}

export interface PlatformStats {
  platform: string;
  total: number;
  avg_rating: number;
}

export interface TimeSeriesData {
  day: string;
  reviews: number;
  avg_rating: number;
}

export function useReviewTotals(filters: AnalyticsFilters) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['reviews:totals', user?.id, filters.from, filters.to, filters.providers],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      let query = supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('date', filters.from)
        .lt('date', filters.to);
        
      if (filters.providers && filters.providers.length > 0) {
        query = query.in('platform', filters.providers);
      }
      
      const { count, error } = await query;
      if (error) throw error;
      
      return { total_reviews: count || 0 };
    },
    enabled: !!user,
  });
}

export function useReviewAverage(filters: AnalyticsFilters) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['reviews:avg', user?.id, filters.from, filters.to, filters.providers],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      let query = supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', user.id)
        .gte('date', filters.from)
        .lt('date', filters.to);
        
      if (filters.providers && filters.providers.length > 0) {
        query = query.in('platform', filters.providers);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { avg_rating: 0 };
      }
      
      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const avg = sum / data.length;
      
      return { avg_rating: Math.round(avg * 100) / 100 };
    },
    enabled: !!user,
  });
}

export function useReviewsByPlatform(filters: AnalyticsFilters) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['reviews:byPlatform', user?.id, filters.from, filters.to],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('reviews')
        .select('platform, rating')
        .eq('user_id', user.id)
        .gte('date', filters.from)
        .lt('date', filters.to);
        
      if (error) throw error;
      
      // Group by platform and calculate stats
      const platformStats: { [key: string]: { ratings: number[], total: number } } = {};
      
      data?.forEach(review => {
        if (!platformStats[review.platform]) {
          platformStats[review.platform] = { ratings: [], total: 0 };
        }
        platformStats[review.platform].ratings.push(review.rating);
        platformStats[review.platform].total++;
      });
      
      return Object.entries(platformStats).map(([platform, stats]) => ({
        platform,
        total: stats.total,
        avg_rating: Math.round((stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length) * 100) / 100
      }));
    },
    enabled: !!user,
  });
}

export function useReviewTimeSeries(filters: AnalyticsFilters) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['reviews:timeseries', user?.id, filters.from, filters.to, filters.providers],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      let query = supabase
        .from('reviews')
        .select('date, rating')
        .eq('user_id', user.id)
        .gte('date', filters.from)
        .lt('date', filters.to);
        
      if (filters.providers && filters.providers.length > 0) {
        query = query.in('platform', filters.providers);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Group by date and calculate stats
      const dateStats: { [key: string]: { ratings: number[], total: number } } = {};
      
      data?.forEach(review => {
        const date = review.date;
        if (!dateStats[date]) {
          dateStats[date] = { ratings: [], total: 0 };
        }
        dateStats[date].ratings.push(review.rating);
        dateStats[date].total++;
      });
      
      return Object.entries(dateStats)
        .map(([day, stats]) => ({
          day,
          reviews: stats.total,
          avg_rating: Math.round((stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length) * 100) / 100
        }))
        .sort((a, b) => a.day.localeCompare(b.day));
    },
    enabled: !!user,
  });
}