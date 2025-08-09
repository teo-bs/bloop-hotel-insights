import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, MessageSquareText, TrendingUp, ArrowDown, Link2, Brain, Lightbulb, BarChart3, Sparkles, Globe, Download } from "lucide-react";
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


        {/* Why Hotels Choose Padu */}
        <section className="bg-royal-tint">
          <div className="container mx-auto px-6 md:px-8 xl:px-12 py-16 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Why Hotels Choose Padu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <Card className="group transition hover:bg-primary/5">
                <div className="p-6 md:p-8 space-y-3">
                  <div className="h-10 w-10 rounded-full bg-accent/20 text-accent grid place-items-center">
                    <BarChart3 className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold">KPI Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Track key performance metrics at a glance with clear, executive dashboards.</p>
                </div>
              </Card>

              {/* Feature 2 */}
              <Card className="group transition hover:bg-primary/5">
                <div className="p-6 md:p-8 space-y-3">
                  <div className="h-10 w-10 rounded-full bg-accent/20 text-accent grid place-items-center">
                    <Sparkles className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold">AI Insights</h3>
                  <p className="text-sm text-muted-foreground">Uncover sentiment trends and guest themes—no manual tagging required.</p>
                </div>
              </Card>

              {/* Feature 3 */}
              <Card className="group transition hover:bg-primary/5">
                <div className="p-6 md:p-8 space-y-3">
                  <div className="h-10 w-10 rounded-full bg-accent/20 text-accent grid place-items-center">
                    <Globe className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold">Multi-Platform Aggregation</h3>
                  <p className="text-sm text-muted-foreground">Consolidate Google, TripAdvisor, Booking.com and more into one view.</p>
                </div>
              </Card>

              {/* Feature 4 */}
              <Card className="group transition hover:bg-primary/5">
                <div className="p-6 md:p-8 space-y-3">
                  <div className="h-10 w-10 rounded-full bg-accent/20 text-accent grid place-items-center">
                    <Download className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold">PDF/CSV Exports</h3>
                  <p className="text-sm text-muted-foreground">Export reports and raw data for presentations, audits, and analysis.</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* See Padu in Action */}
        <section className="w-full">
          <div className="container mx-auto px-6 md:px-8 xl:px-12 py-16 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">See Padu in Action</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Text (mobile first) */}
              <div className="order-1 lg:order-2 space-y-4">
                <p className="text-muted-foreground max-w-prose">
                  Explore the dashboard that turns scattered guest feedback into clear trends and action steps. Save time, spot issues early, and consistently delight your guests.
                </p>
                <Button size="lg">Start Your Free Trial</Button>
              </div>
              {/* Screenshot */}
              <div className="order-2 lg:order-1 relative">
                <div className="rounded-xl border overflow-hidden">
                  <img src="/placeholder.svg" alt="Padu dashboard screenshot (blurred)" className="w-full h-auto object-cover blur-[1px]" loading="lazy" />
                </div>
                <button aria-label="Play demo" className="absolute inset-0 m-auto h-14 w-14 grid place-items-center rounded-full bg-background/80 border shadow-lg hover-scale">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-royal-tint">
          <div className="container mx-auto px-6 md:px-8 xl:px-12 py-16 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Loved by Hotel Managers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Amelia Brown", hotel: "Seaside Resort", quote: "Padu helped us double our 5-star reviews in just 60 days.", initials: "AB" },
                { name: "Liam Chen", hotel: "Urban Loft Hotel", quote: "Our team finally has one place to understand what guests really say.", initials: "LC" },
                { name: "Sofia Martinez", hotel: "Mountain View Lodge", quote: "The AI insights are spot on and easy to act on.", initials: "SM" },
              ].map((t, i) => (
                <Card key={i} className="relative overflow-hidden">
                  <div className="absolute -top-4 -right-2 text-accent/10" aria-hidden="true">“</div>
                  <div className="p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/20 grid place-items-center font-bold">{t.initials}</div>
                      <div>
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.hotel}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-accent">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <svg key={j} viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.897l-7.336 3.869 1.402-8.168L.132 9.211l8.2-1.193z"/></svg>
                      ))}
                    </div>
                    <p className="text-muted-foreground">{t.quote}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <div className="container mx-auto px-6 md:px-8 xl:px-12 py-16 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Simple, Transparent Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Starter */}
              <Card className="flex flex-col">
                <div className="p-6 md:p-8 space-y-4 flex-1">
                  <div className="text-sm text-muted-foreground">Starter</div>
                  <div className="text-3xl font-bold">$19<span className="text-base font-medium">/mo</span></div>
                  <ul className="text-sm space-y-2">
                    <li>• 1 hotel</li>
                    <li>• Weekly AI insights</li>
                    <li>• Google, TripAdvisor, Booking.com</li>
                    <li>• Email support</li>
                  </ul>
                </div>
                <div className="p-6 pt-0">
                  <Button className="w-full">Get Started</Button>
                </div>
              </Card>

              {/* Pro */}
              <Card className="flex flex-col ring-2 ring-accent scale-[1.02]">
                <div className="p-6 md:p-8 space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Pro</div>
                    <span className="text-xs rounded-full bg-accent/20 text-accent px-2 py-1">Most Popular</span>
                  </div>
                  <div className="text-3xl font-bold">$49<span className="text-base font-medium">/mo</span></div>
                  <ul className="text-sm space-y-2">
                    <li>• Up to 5 hotels</li>
                    <li>• Daily AI insights</li>
                    <li>• All integrations</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
                <div className="p-6 pt-0">
                  <Button className="w-full">Get Started</Button>
                </div>
              </Card>

              {/* Enterprise */}
              <Card className="flex flex-col">
                <div className="p-6 md:p-8 space-y-4 flex-1">
                  <div className="text-sm text-muted-foreground">Enterprise</div>
                  <div className="text-3xl font-bold">Custom</div>
                  <ul className="text-sm space-y-2">
                    <li>• Unlimited hotels</li>
                    <li>• Real-time AI insights</li>
                    <li>• Custom integrations</li>
                    <li>• Dedicated success manager</li>
                  </ul>
                </div>
                <div className="p-6 pt-0 flex items-center gap-2">
                  <Button className="flex-1">Get Started</Button>
                  <Button variant="secondary" className="flex-1">Contact Sales</Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-royal-tint">
          <div className="container mx-auto px-6 md:px-8 xl:px-12 py-16 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="rounded-2xl bg-card shadow-sm border p-2 md:p-4">
              <div className="grid grid-cols-1 gap-2">
                {[
                  { q: "What platforms can I connect?", a: "Google, TripAdvisor, Booking.com, and CSV import for custom data." },
                  { q: "How secure is my data?", a: "We follow best practices for data handling and secure connectivity." },
                  { q: "Can I try before paying?", a: "Yes, start a free trial—no credit card required." },
                  { q: "How often are insights updated?", a: "Depending on plan: weekly, daily, or real-time for Enterprise." },
                  { q: "Can I cancel anytime?", a: "Absolutely. You can cancel your subscription at any time." },
                  { q: "Do you support multi-property setups?", a: "Yes, Padu supports multiple properties under one account." },
                ].map((item, idx) => (
                  <details key={idx} className="group rounded-xl bg-white p-4 border">
                    <summary className="flex cursor-pointer list-none items-center justify-between">
                      <span className="font-medium">{item.q}</span>
                      <span className="ml-4 h-6 w-6 grid place-items-center rounded-md bg-muted text-foreground transition group-open:bg-accent group-open:text-accent-foreground">{/* plus/minus */}
                        <span className="block group-open:hidden">+</span>
                        <span className="hidden group-open:block">−</span>
                      </span>
                    </summary>
                    <div className="mt-2 text-sm text-muted-foreground">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 md:px-8 xl:px-12 py-12 md:py-16">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-4">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-bold">Ready to see what your guests really think?</h3>
                <p className="mt-2 text-primary-foreground/90">Join hundreds of hotel managers using Padu to delight guests and boost reviews.</p>
              </div>
              <Button className="bg-[hsl(var(--accent))] text-[hsl(var(--primary-foreground))] rounded-2xl px-6 py-6 hover:shadow-2xl">Get Started Free</Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[hsl(var(--foreground))] text-[hsl(var(--primary-foreground))]">
          <div className="container mx-auto px-6 md:px-8 xl:px-12 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div>
              <div className="text-xl font-bold">Padu</div>
              <p className="text-sm text-primary-foreground/80 mt-1">AI-powered guest insights for hotels.</p>
            </div>
            <nav className="text-sm mx-auto">
              <ul className="flex flex-col md:flex-row gap-3 md:gap-6">
                <li><a className="hover:text-[hsl(var(--accent))]" href="#pricing">Pricing</a></li>
                <li><a className="hover:text-[hsl(var(--accent))]" href="#docs">Docs</a></li>
                <li><a className="hover:text-[hsl(var(--accent))]" href="#contact">Contact</a></li>
                <li><a className="hover:text-[hsl(var(--accent))]" href="#privacy">Privacy</a></li>
                <li><a className="hover:text-[hsl(var(--accent))]" href="#terms">Terms</a></li>
              </ul>
            </nav>
            <div className="flex md:justify-end gap-3">
              <a href="#" aria-label="LinkedIn" className="hover:text-[hsl(var(--accent))]">{/* LinkedIn */}
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7 0h3.8v2.2h.1c.5-1 1.8-2.2 3.7-2.2 4 0 4.8 2.6 4.8 6V24h-4v-7.2c0-1.7 0-3.8-2.3-3.8-2.3 0-2.7 1.8-2.7 3.7V24h-4V8z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-[hsl(var(--accent))]">{/* Twitter */}
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden><path d="M24 4.6a9.9 9.9 0 0 1-2.8.8 4.9 4.9 0 0 0 2.1-2.7 9.9 9.9 0 0 1-3.1 1.2 4.9 4.9 0 0 0-8.3 4.5A13.9 13.9 0 0 1 1.7 3.1a4.9 4.9 0 0 0 1.5 6.6 4.9 4.9 0 0 1-2.2-.6v.1a4.9 4.9 0 0 0 3.9 4.8 4.9 4.9 0 0 1-2.2.1 4.9 4.9 0 0 0 4.6 3.4A9.9 9.9 0 0 1 0 21.5 14 14 0 0 0 7.5 24c9 0 13.9-7.5 13.9-13.9v-.6A9.7 9.7 0 0 0 24 4.6z"/></svg>
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>;
}