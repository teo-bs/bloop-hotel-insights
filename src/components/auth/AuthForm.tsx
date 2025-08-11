import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, Loader2, LogIn, Plus } from "lucide-react";

export type AuthMode = "signin" | "signup" | "reset";

interface AuthFormProps {
  mode: AuthMode;
  onModeChange?: (m: AuthMode) => void;
  onSuccess?: () => void;
  compactHeader?: boolean; // for modal to reduce spacing
}

export default function AuthForm({ mode, onModeChange, onSuccess, compactHeader }: AuthFormProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [errorTop, setErrorTop] = useState<string | null>(null);

  useEffect(() => {
    setErrorTop(null);
  }, [mode]);

  const strength = useMemo(() => {
    const pwd = password || "";
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0..4
  }, [password]);

  const strengthLabel = ["Weak", "Okay", "Okay", "Strong", "Strong"][strength] || "Weak";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorTop(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Signed in!", description: "Welcome back." });
        document.dispatchEvent(new CustomEvent("auth:success"));
        onSuccess?.();
      } else if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: fullName ? { full_name: fullName } : undefined, emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "Check your email if verification is required." });
        document.dispatchEvent(new CustomEvent("auth:success"));
        onSuccess?.();
      } else if (mode === "reset") {
        const redirectUrl = `${window.location.origin}/auth?mode=signin`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
        if (error) throw error;
        toast({ title: "Email sent", description: "Check your inbox for the reset link." });
      }
    } catch (err: any) {
      const msg = err?.message || "Authentication failed";
      setErrorTop(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(provider: "signin" | "signup") {
    setLoading(true);
    setErrorTop(null);
    try {
      const redirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) throw error;
    } catch (err: any) {
      const msg = err?.message || "Google auth failed";
      setErrorTop(msg);
      toast({ title: "Google auth failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border border-white/40 bg-card/70 backdrop-blur-md shadow-[0_8px_24px_hsl(var(--foreground)/0.06)]">
      <CardHeader className={compactHeader ? "pb-4" : "pb-6"}>
        {/* small logo mark */}
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-background/70">
          <img src="/lovable-uploads/10e2e94b-0e70-490d-bc29-2f836e6ddf32.png" alt="Padu logo" className="h-8 w-8 rounded-lg" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          {mode === "signin" && "Sign in"}
          {mode === "signup" && "Create your free Padu account"}
          {mode === "reset" && "Reset your password"}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === "signin" && "Use email and password to continue."}
          {mode === "signup" && "Save and track reviews. No credit card required."}
          {mode === "reset" && "Enter your email and we’ll send a reset link."}
        </CardDescription>
        <div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>We use industry-standard encryption.</span>
        </div>
        {mode === "signin" && (
          <div className="mt-1 text-center text-xs text-muted-foreground">
            Create a free account to save and track reviews. No credit card required.
          </div>
        )}
        {errorTop && (
          <div role="alert" className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorTop}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form id={mode === "signin" ? "form-signin" : mode === "signup" ? "form-signup" : "form-reset"} onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full name (optional)</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="signup-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9 rounded-full shadow-inner" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={mode === "reset" ? "reset-email" : mode === "signin" ? "signin-email" : "signup-email"}>Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={mode === "reset" ? "reset-email" : mode === "signin" ? "signin-email" : "signup-email"}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9 rounded-full shadow-inner"
              />
            </div>
          </div>

          {mode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor={mode === "signin" ? "signin-password" : "signup-password"}>Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={mode === "signin" ? "signin-password" : "signup-password"}
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e: any) => setCapsLock(!!e.getModifierState?.("CapsLock"))}
                  required
                  className="pl-9 pr-10 rounded-full shadow-inner"
                  aria-invalid={!!errorTop}
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsLock && <div className="text-xs text-muted-foreground">Caps Lock is on</div>}
              {mode === "signup" && (
                <div className="text-xs">
                  <span className={
                    strength >= 3
                      ? "text-green-600"
                      : strength === 2
                      ? "text-amber-600"
                      : "text-red-600"
                  }>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>
          )}

          <Button
            id={mode === "signin" ? "btn-signin" : mode === "signup" ? "btn-signup" : "btn-reset"}
            type="submit"
            disabled={loading}
            className="w-full rounded-full"
            variant="hero"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />
                {mode === "signin" ? "Signing in…" : mode === "signup" ? "Creating account…" : "Sending link…"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                {mode === "signin" ? <LogIn className="h-4 w-4" /> : mode === "signup" ? <Plus className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
              </span>
            )}
          </Button>

          {mode !== "reset" && (
            <>
              <div className="relative py-1 text-center text-xs text-muted-foreground">
                <span className="bg-background px-2">or</span>
                <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-border" />
              </div>
              <Button
                id={mode === "signin" ? "btn-google-signin" : "btn-google-signup"}
                type="button"
                variant="outline"
                className="w-full rounded-full"
                onClick={() => handleGoogle(mode)}
              >
                Continue with Google
              </Button>
            </>
          )}

          <div className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "signin" && (
              <>
                <button className="underline" type="button" onClick={() => onModeChange?.("reset")}>Forgot password?</button>
                <span className="mx-2">•</span>
                <button className="underline" type="button" onClick={() => onModeChange?.("signup")}>Need an account? Sign up</button>
              </>
            )}
            {mode === "signup" && (
              <>
                <span>By continuing you agree to our </span>
                <a className="underline" href="#" target="_blank" rel="noreferrer">Terms</a>
                <span> and </span>
                <a className="underline" href="#" target="_blank" rel="noreferrer">Privacy</a>
                <div className="mt-2">We’ll email you a verification link if needed.</div>
                <div className="mt-2"><button className="underline" type="button" onClick={() => onModeChange?.("signin")}>Already have an account? Sign in</button></div>
              </>
            )}
            {mode === "reset" && (
              <button className="underline" type="button" onClick={() => onModeChange?.("signin")}>Back to sign in</button>
            )}
          </div>
          <div className="text-center text-xs text-muted-foreground">We never share your email.</div>
        </form>
      </CardContent>
    </Card>
  );
}
