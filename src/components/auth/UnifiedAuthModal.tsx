import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resumePendingAfterAuth } from "@/lib/savePreview";
import { getAuthRedirectUrl } from "@/lib/auth-config";

type AuthMode = "signin" | "signup" | "reset";

export default function NewUnifiedAuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
      setMode("signin");
      setErrorMessage(null);
      setResetSent(false);
      setEmail("");
      setPassword("");
      setFullName("");
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

  const passwordStrength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  async function handleGoogleAuth() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getAuthRedirectUrl() }
      });
      if (error) throw error;
    } catch (err: any) {
      const msg = err?.message || "Google auth failed";
      setErrorMessage(msg);
      toast({ title: "Google auth failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailPasswordAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Incorrect email or password.");
          }
          throw error;
        }
        toast({ title: "Welcome back 👋", description: "You're signed in." });
        document.dispatchEvent(new CustomEvent("auth:success"));
        setOpen(false);
        
        try {
          const did = await resumePendingAfterAuth();
          if (!did) {
            const { redirectToApp } = await import("@/utils/domain");
            redirectToApp('/dashboard');
          }
        } catch {
          const { redirectToApp } = await import("@/utils/domain");
          redirectToApp('/dashboard');
        }
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: fullName ? { full_name: fullName } : undefined,
            emailRedirectTo: getAuthRedirectUrl()
          },
        });
        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error("Account exists via Google—use Continue with Google or reset your password.");
          }
          throw error;
        }
        toast({ title: "Account created. You're all set.", description: "Welcome to Padu!" });
        document.dispatchEvent(new CustomEvent("auth:success"));
        setOpen(false);
        
        try {
          const did = await resumePendingAfterAuth();
          if (!did) {
            const { redirectToApp } = await import("@/utils/domain");
            redirectToApp('/dashboard');
          }
        } catch {
          const { redirectToApp } = await import("@/utils/domain");
          redirectToApp('/dashboard');
        }
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`
        });
        if (error) throw error;
        setResetSent(true);
        toast({ title: "Check your email for a reset link.", description: "We sent password reset instructions." });
      }
    } catch (err: any) {
      const msg = err?.message || "Authentication failed";
      setErrorMessage(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (mode === "reset" && resetSent) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-white/15 backdrop-blur-md border-0 shadow-none modal-overlay">
          <div className="max-w-[440px] w-[88vw] mx-auto">
            <Card className="w-full rounded-2xl border border-white/40 bg-white/90 backdrop-blur-md shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
              <CardHeader className="pb-4 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                  <img src="/lovable-uploads/10e2e94b-0e70-490d-bc29-2f836e6ddf32.png" alt="Padu logo" className="h-8 w-8 rounded-lg" />
                </div>
                <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                <CardDescription>We sent password reset instructions to {email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="glass" 
                  className="w-full" 
                  onClick={() => {
                    setResetSent(false);
                    setMode("signin");
                  }}
                >
                  Back to sign in
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
      <DialogContent className="p-0 bg-white/15 backdrop-blur-md border-0 shadow-none modal-overlay">
        <div className="max-w-[440px] w-[88vw] mx-auto">
          <Card className="w-full rounded-2xl border border-white/40 bg-white/90 backdrop-blur-md shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                <img src="/lovable-uploads/10e2e94b-0e70-490d-bc29-2f836e6ddf32.png" alt="Padu logo" className="h-8 w-8 rounded-lg" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                {mode === "signin" && "Continue to Padu"}
                {mode === "signup" && "Create your free Padu account"}
                {mode === "reset" && "Reset your password"}
              </CardTitle>
              <CardDescription className="text-center">
                {mode === "signin" && "No credit card required."}
                {mode === "signup" && "No credit card required."}
                {mode === "reset" && "Enter your email to receive reset instructions."}
              </CardDescription>
              <div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>We use industry-standard encryption.</span>
              </div>
              {errorMessage && (
                <div role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google Button */}
              <Button
                type="button"
                variant="hero"
                className="w-full"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  <>
                    <img src="/logos/google.svg" alt="Google" className="h-4 w-4" />
                    Continue with Google
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative py-1 text-center text-xs text-muted-foreground">
                <span className="bg-white px-2">or</span>
                <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-gray-200" />
              </div>

              {/* Email + Password Form */}
              <form onSubmit={handleEmailPasswordAuth} className="space-y-3">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Full name (optional)</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9 rounded-full shadow-inner focus-ring"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-invalid={!!errorMessage}
                      className="pl-9 rounded-full shadow-inner focus-ring"
                    />
                  </div>
                </div>

                {mode !== "reset" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={(e: any) => setCapsLock(!!e.getModifierState?.("CapsLock"))}
                        required
                        aria-invalid={!!errorMessage}
                        className="pl-9 pr-10 rounded-full shadow-inner focus-ring"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {capsLock && <div className="text-xs text-amber-600">Caps Lock is on</div>}
                    {mode === "signup" && password && (
                      <div className="text-xs">
                        <span className={passwordStrength ? "text-green-600" : "text-amber-600"}>
                          {passwordStrength ? "Strong" : "Needs letter, number, and 8+ characters"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  variant="hero"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {mode === "signin" ? "Signing in..." : mode === "signup" ? "Creating account..." : "Sending link..."}
                    </span>
                  ) : (
                    mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"
                  )}
                </Button>
              </form>

              {/* Mode Switching Links */}
              <div className="text-center text-sm text-muted-foreground space-y-2">
                {mode === "signin" && (
                  <>
                    <div>
                      <button 
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setMode("reset")}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div>
                      <button 
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setMode("signup")}
                      >
                        Create account
                      </button>
                    </div>
                  </>
                )}
                {mode === "signup" && (
                  <div>
                    <button 
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setMode("signin")}
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                )}
                {mode === "reset" && (
                  <div>
                    <button 
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setMode("signin")}
                    >
                      Back to sign in
                    </button>
                  </div>
                )}
              </div>

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