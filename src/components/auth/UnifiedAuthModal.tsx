import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resumePendingAfterAuth } from "@/lib/savePreview";
import { getAuthRedirectUrl } from "@/lib/auth-config";

export default function UnifiedAuthModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [errorTop, setErrorTop] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
      setEmailSent(false);
      setShowPasswordFields(false);
      setErrorTop(null);
    }
    function handleSuccess() {
      setOpen(false);
    }
    document.addEventListener("auth:open" as any, handleOpen as any);
    document.addEventListener("auth:success" as any, handleSuccess as any);
    return () => {
      document.removeEventListener("auth:open" as any, handleOpen as any);
      document.removeEventListener("auth:success" as any, handleSuccess as any);
    };
  }, []);

  useEffect(() => {
    if (emailSent) {
      const timer = setTimeout(() => setCanResend(true), 30000); // 30s
      return () => clearTimeout(timer);
    }
  }, [emailSent]);

  async function continueWithGoogle() {
    setLoading(true);
    setErrorTop(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getAuthRedirectUrl() }
      });
      if (error) throw error;
    } catch (err: any) {
      const msg = err?.message || "Google auth failed";
      setErrorTop(msg);
      toast({ title: "Google auth failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function continueWithEmail() {
    if (!email) return;
    setLoading(true);
    setErrorTop(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: getAuthRedirectUrl() }
      });
      if (error) throw error;
      setEmailSent(true);
      setCanResend(false);
      toast({ title: "Check your email", description: "We sent you a sign-in link" });
    } catch (err: any) {
      const msg = err?.message || "Failed to send email";
      setErrorTop(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorTop(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Signed in!", description: "Welcome back." });
      document.dispatchEvent(new CustomEvent("auth:success"));
      setOpen(false);
      try {
        const did = await resumePendingAfterAuth();
        if (!did) window.location.href = "/dashboard";
      } catch {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      const msg = err?.message || "Sign in failed";
      setErrorTop(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-transparent border-0 shadow-none">
          <div id="auth-modal" className="max-w-[440px] w-[88vw] mx-auto">
            <Card className="w-full rounded-2xl border border-white/40 bg-card/70 backdrop-blur-md shadow-[0_8px_24px_hsl(var(--foreground)/0.06)]">
              <CardHeader className="pb-4 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background/70">
                  <img src="/lovable-uploads/10e2e94b-0e70-490d-bc29-2f836e6ddf32.png" alt="Padu logo" className="h-8 w-8 rounded-lg" />
                </div>
                <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                <CardDescription>We sent a sign-in link to {email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  Didn't receive it? 
                  {canResend ? (
                    <button 
                      type="button" 
                      className="ml-1 underline text-primary" 
                      onClick={() => {
                        setEmailSent(false);
                        continueWithEmail();
                      }}
                    >
                      Resend link
                    </button>
                  ) : (
                    <span className="ml-1">Check your spam folder or wait 30s to resend</span>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full rounded-full" 
                  onClick={() => setEmailSent(false)}
                >
                  Try a different email
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 bg-transparent border-0 shadow-none">
        <div id="auth-modal" className="max-w-[440px] w-[88vw] mx-auto">
          <Card className="w-full rounded-2xl border border-white/40 bg-card/70 backdrop-blur-md shadow-[0_8px_24px_hsl(var(--foreground)/0.06)]">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-background/70">
                <img src="/lovable-uploads/10e2e94b-0e70-490d-bc29-2f836e6ddf32.png" alt="Padu logo" className="h-8 w-8 rounded-lg" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Continue to Padu</CardTitle>
              <CardDescription className="text-center">No credit card required.</CardDescription>
              <div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>We use industry-standard encryption.</span>
              </div>
              {errorTop && (
                <div role="alert" className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorTop}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google Button */}
              <Button
                id="btn-google-auth"
                type="button"
                variant="hero"
                className="w-full rounded-full"
                onClick={continueWithGoogle}
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  "Continue with Google"
                )}
              </Button>

              {/* Divider */}
              <div className="relative py-1 text-center text-xs text-muted-foreground">
                <span className="bg-background px-2">or</span>
                <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-border" />
              </div>

              {/* Email Magic Link */}
              {!showPasswordFields ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="email-input" className="sr-only">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email-input"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 rounded-full shadow-inner"
                          onKeyDown={(e) => e.key === 'Enter' && continueWithEmail()}
                        />
                      </div>
                    </div>
                    <Button
                      id="btn-email-link"
                      onClick={continueWithEmail}
                      disabled={!email || loading}
                      className="rounded-full px-6"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <button 
                      type="button"
                      className="text-sm text-muted-foreground underline"
                      onClick={() => setShowPasswordFields(true)}
                    >
                      Have a password? Click here
                    </button>
                  </div>
                </div>
              ) : (
                /* Password Fields */
                <form onSubmit={signInWithPassword} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-9 rounded-full shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-9 pr-10 rounded-full shadow-inner"
                      />
                      <button
                        type="button"
                        aria-label={showPw ? "Hide password" : "Show password"}
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full"
                    variant="hero"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </Button>

                  <div className="text-center">
                    <button 
                      type="button"
                      className="text-sm text-muted-foreground underline"
                      onClick={() => setShowPasswordFields(false)}
                    >
                      Back to magic link
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center text-xs text-muted-foreground">
                We never share your email.
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}