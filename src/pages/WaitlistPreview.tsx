import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Star, TrendingUp, Lightbulb, BarChart3 } from "lucide-react";
import WaitlistModal from "@/components/waitlist/WaitlistModal";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { isAdmin } from "@/lib/admin";

export default function WaitlistPreview() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        isAdmin().then(setIsAdminUser);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        isAdmin().then(setIsAdminUser);
      } else {
        setIsAdminUser(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const demoCards = [
    {
      title: "Average Guest Rating",
      value: "4.5",
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      subtitle: "Based on 2,847 reviews",
      trend: "+0.3 this month",
      locked: false
    },
    {
      title: "Impact on Bookings",
      value: "72%",
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      subtitle: "Revenue increase",
      trend: "+15% vs last quarter",
      locked: false
    },
    {
      title: "Top Insight",
      value: "Breakfast Quality",
      icon: <Lightbulb className="w-6 h-6 text-blue-500" />,
      subtitle: "Most mentioned topic",
      trend: "347 mentions",
      locked: false
    },
    {
      title: "Competition Benchmarking",
      value: "Coming Soon",
      icon: <BarChart3 className="w-6 h-6 text-muted-foreground" />,
      subtitle: "Compare against 50+ hotels",
      trend: "Early access feature",
      locked: true
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gpt5-gradient animate-gpt5-pan relative overflow-hidden">
        {/* Noise overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-white/10 bg-background/10 backdrop-blur-md">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/048c2a9e-abc8-4951-8a52-70b7d76192f3.png" 
                  alt="Padu" 
                  className="w-8 h-8 rounded-lg"
                />
                <span className="font-bold text-lg text-primary-foreground">Padu</span>
                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground border-primary/30">
                  Preview
                </Badge>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="container mx-auto px-6 py-12">
            <div className="max-w-6xl mx-auto">
              {/* Hero section */}
              <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                  Get a sneak peek at your
                  <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Hotel Intelligence Dashboard
                  </span>
                </h1>
                <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                  See how Padu transforms thousands of reviews into actionable insights that drive real business results.
                </p>
              </div>

              {/* Demo cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {demoCards.map((card, index) => (
                  <Card 
                    key={index}
                    className={`p-6 bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] relative overflow-hidden ${
                      card.locked ? 'opacity-75' : ''
                    }`}
                  >
                    {card.locked && (
                      <div className="absolute top-4 right-4">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/10 rounded-xl">
                        {card.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary-foreground mb-1">
                          {card.title}
                        </h3>
                        <p className="text-2xl font-bold text-primary-foreground mb-1">
                          {card.value}
                        </p>
                        <p className="text-sm text-primary-foreground/80 mb-2">
                          {card.subtitle}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            card.locked 
                              ? 'bg-muted/20 text-muted-foreground border-muted/30'
                              : 'bg-accent/20 text-accent-foreground border-accent/30'
                          }`}
                        >
                          {card.trend}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* CTA section */}
              <div className="text-center">
                <Card className="inline-block p-8 bg-card/20 backdrop-blur-xl border-border/30 rounded-2xl">
                  <h2 className="text-2xl font-bold text-primary-foreground mb-4">
                    Ready to unlock your hotel's potential?
                  </h2>
                  <p className="text-primary-foreground/90 mb-6 max-w-md">
                    {user && isAdminUser 
                      ? "Welcome back, admin! You have full access to the dashboard." 
                      : user 
                        ? "Welcome back! Your access is being prepared." 
                        : "Be among the first to access Padu's full suite of AI-powered hotel intelligence tools."
                    }
                  </p>
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={() => navigate('/dashboard')}
                          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl"
                        >
                          Continue to Dashboard
                        </Button>
                        {isAdminUser && (
                          <Button 
                            asChild
                            variant="outline"
                            className="border-primary/30 text-primary-foreground hover:bg-primary/10 font-semibold px-8 py-3 rounded-xl"
                          >
                            <Link to="/admin/waitlist">View Waitlist</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="lg"
                      onClick={() => setShowWaitlistModal(true)}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Be First to Access → Join Waitlist
                    </Button>
                  )}
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>

      <WaitlistModal 
        open={showWaitlistModal}
        onOpenChange={setShowWaitlistModal}
      />
    </>
  );
}