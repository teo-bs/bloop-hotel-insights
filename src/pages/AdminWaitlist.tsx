import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  role: string;
  hotel_name: string | null;
  created_at: string;
}

export default function AdminWaitlist() {
  const { user, loading } = useAuth();
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simple auth check - you can enhance this with proper admin roles
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const fetchWaitlistEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('waitlist')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching waitlist entries:', error);
          // Handle unauthorized access gracefully
          if (error.message?.includes('row-level security')) {
            setWaitlistEntries([]);
          }
        } else {
          setWaitlistEntries(data || []);
        }
      } catch (error) {
        console.error('Error fetching waitlist entries:', error);
        setWaitlistEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlistEntries();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'GM':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'Owner':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'CEO':
        return 'bg-gold-500/20 text-yellow-300 border-yellow-400/30';
      case 'Marketing':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Waitlist Admin</h1>
          <p className="text-white/70">
            {waitlistEntries.length} users waiting for early access
          </p>
        </div>

        {isLoading ? (
          <div className="grid place-items-center h-64">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading waitlist...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {waitlistEntries.map((entry) => (
              <Card 
                key={entry.id}
                className="p-6 bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white text-lg">
                        {entry.name}
                      </h3>
                      <Badge className={getRoleBadgeColor(entry.role)}>
                        {entry.role}
                      </Badge>
                    </div>
                    
                    <p className="text-white/80">
                      {entry.email}
                    </p>
                    
                    {entry.hotel_name && (
                      <p className="text-white/60 text-sm">
                        Hotel: {entry.hotel_name}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-white/50">
                    <p>Joined</p>
                    <p>{format(new Date(entry.created_at), 'MMM d, yyyy')}</p>
                    <p>{format(new Date(entry.created_at), 'h:mm a')}</p>
                  </div>
                </div>
              </Card>
            ))}

            {waitlistEntries.length === 0 && (
              <Card className="p-12 text-center bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                <p className="text-white/60 text-lg">No waitlist entries yet</p>
                <p className="text-white/40 text-sm mt-2">
                  Users who join the waitlist will appear here
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}