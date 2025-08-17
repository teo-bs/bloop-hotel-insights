import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "signin" | "signup" | "reset";

interface UnifiedAuthFormProps {
  mode: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  onSuccess?: () => void;
}

export default function UnifiedAuthForm({ mode, onModeChange, onSuccess }: UnifiedAuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  
  const { signInWithPassword, signUp, signInWithGoogle, resetPassword } = useAuth();

  const passwordStrength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  async function handleGoogleAuth() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      const msg = err?.message || "Google auth failed";
      setErrorMessage(msg);
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
        const { error } = await signInWithPassword(email, password);
        if (error) throw error;
        onSuccess?.();
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        onSuccess?.();
      } else if (mode === "reset") {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setResetSent(true);
      }
    } catch (err: any) {
      const msg = err?.message || "Authentication failed";
      setErrorMessage(msg);
      
      // Handle specific error cases for better UX
      if (mode === "signup" && msg.includes("already registered")) {
        // Show helpful message for existing users
        setErrorMessage("This email already has an account.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (mode === "reset" && resetSent) {
    return (
      <Card className="w-full max-w-md rounded-2xl border border-white/40 bg-white/90 backdrop-blur-md shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
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
              onModeChange?.("signin");
            }}
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border border-white/40 bg-white/90 backdrop-blur-md shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
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
            {/* Show helpful actions for duplicate email */}
            {mode === "signup" && errorMessage.includes("already has an account") && (
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => onModeChange?.("signin")}
                >
                  Sign in instead
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                >
                  Continue with Google
                </Button>
              </div>
            )}
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
                  onClick={() => onModeChange?.("reset")}
                >
                  Forgot password?
                </button>
              </div>
              <div>
                <button 
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => onModeChange?.("signup")}
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
                onClick={() => onModeChange?.("signin")}
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
                onClick={() => onModeChange?.("signin")}
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
  );
}