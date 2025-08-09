import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, MessageSquareText, TrendingUp, ArrowDown, Link2, Brain, Lightbulb } from "lucide-react";
import TopNav from "@/components/layout/TopNav";
import { openIntegrationsModal } from "@/lib/actions";
export default function Index() {
  
  return <>
      <TopNav />
      <main>
        <section className="relative overflow-hidden bg-royal-diagonal-animated">
          {/* subtle texture overlay */}
          <div className="absolute inset-0 texture-dots texture-dots-animate pointer-events-none" aria-hidden="true" />

          <div className="container mx-auto px-6 md:px-8 xl:px-12 py-16 md:py-20 xl:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-center">
              {/* Copy column */}
              <div className="text-center lg:text-left space-y-6 md:space-y-8 animate-fade-in">
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight">
                  Your Reviews, All in One Place.
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  Padu turns feedback into clear, AI-powered hotel insights.
                </p>

                {/* KPI chips */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4">
                  <div className="flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur px-3 py-2 text-sm shadow-sm">
                    <Star className="h-4 w-4 text-accent" />
                    <span>Avg Rating <span className="font-bold">★ 4.3</span></span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur px-3 py-2 text-sm shadow-sm">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                    <span><span className="font-bold">12,482</span> Reviews</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur px-3 py-2 text-sm shadow-sm">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span><span className="font-bold">72%</span> Positive</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pt-2">
                  <Button variant="hero" size="lg" id="cta-connect-sources" onClick={openIntegrationsModal} className="px-6 py-3 text-base animate-pulse-8s">
                    Connect My Review Sources
                  </Button>
                  
                </div>

                {/* Trust logos */}
                <div className="pt-4 md:pt-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground text-center lg:text-left mb-3">Trusted by 200+ hotel managers worldwide</p>
                  <div className="flex items-center justify-center lg:justify-start gap-6 opacity-80">
                    <img src="/logos/hotels/marriott.svg" alt="Marriott logo" className="h-6 md:h-7 lg:h-8 grayscale" loading="lazy" />
                    <img src="/logos/hotels/hilton.svg" alt="Hilton logo" className="h-6 md:h-7 lg:h-8 grayscale" loading="lazy" />
                    <img src="/logos/hotels/hyatt.svg" alt="Hyatt logo" className="h-6 md:h-7 lg:h-8 grayscale" loading="lazy" />
                    <img src="/logos/hotels/accor.svg" alt="Accor logo" className="h-6 md:h-7 lg:h-8 grayscale" loading="lazy" />
                    <img src="/logos/hotels/ihg.svg" alt="IHG logo" className="h-6 md:h-7 lg:h-8 grayscale" loading="lazy" />
                  </div>
                </div>
              </div>

              {/* Illustration column */}
              <div className="relative order-first lg:order-none animate-slide-up">
                {/* floating glass insight card */}
                <div className="relative mx-auto lg:ml-8 w-full max-w-md">
                  <div className="rounded-2xl border border-accent/50 bg-background/40 backdrop-blur-md shadow-xl p-6 md:p-8 animate-float-slow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Sentiment</span>
                        <span className="text-sm font-bold text-accent">+72%</span>
                      </div>
                      <div className="h-24 rounded-md bg-gradient-to-b from-primary/20 to-transparent" />
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-md border p-3">
                          <div className="text-xs text-muted-foreground">Avg Rating</div>
                          <div className="text-xl font-bold">4.3</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="text-xs text-muted-foreground">Reviews</div>
                          <div className="text-xl font-bold">12,482</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="text-xs text-muted-foreground">Positive</div>
                          <div className="text-xl font-bold">72%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* subtle glow */}
                  <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-tr from-primary/20 via-transparent to-transparent blur-2xl" />
                </div>
              </div>
            </div>
          </div>
          {/* Down arrow scroll */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6">
            <button
              type="button"
              onClick={() => document.getElementById("how-padu-works")?.scrollIntoView({ behavior: "smooth" })}
              aria-label="Scroll to How Padu Works"
              className="rounded-full border bg-card/70 backdrop-blur px-3 py-2 hover-scale"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* How Padu Works */}
        <section id="how-padu-works" className="bg-royal-tint">
          <div className="container mx-auto px-6 md:px-8 xl:px-12 py-16 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">How Padu Works</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Step 1 */}
              <Card className="hover-scale">
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Link2 className="h-6 w-6 text-accent" />
                    <h3 className="text-xl font-semibold">Connect Review Sources</h3>
                  </div>
                  <p className="text-muted-foreground">Link Google, TripAdvisor, Booking.com or upload CSV.</p>
                </div>
              </Card>
              {/* Step 2 */}
              <Card className="hover-scale">
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-6 w-6 text-accent" />
                    <h3 className="text-xl font-semibold">Analyze Sentiment & Trends</h3>
                  </div>
                  <p className="text-muted-foreground">Our AI detects patterns and guest themes automatically.</p>
                </div>
              </Card>
              {/* Step 3 */}
              <Card className="hover-scale">
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="h-6 w-6 text-accent" />
                    <h3 className="text-xl font-semibold">Get Clear Insights</h3>
                  </div>
                  <p className="text-muted-foreground">Receive prioritized recommendations to improve guest satisfaction.</p>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </>;
}