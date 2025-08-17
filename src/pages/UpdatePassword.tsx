import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopNav from "@/components/layout/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    // Check if we have the required tokens in the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast({
        title: "Invalid reset link",
        description: "Please request a new password reset link.",
        variant: "destructive"
      });
      // Open auth modal instead of navigating to /auth
      document.dispatchEvent(new CustomEvent("auth:open", { detail: { mode: "reset" } }));
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate, toast]);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (!passwordsMatch) {
      setError("Passwords don't match");
      return;
    }
    
    if (!passwordStrength) {
      setError("Password must be at least 8 characters with a letter and number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });
      
      // Redirect to app
      const { redirectToApp } = await import("@/utils/domain");
      redirectToApp('/dashboard');
      
    } catch (err: any) {
      const msg = err?.message || "Failed to update password";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopNav />
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 md:p-10 bg-gpt5-gradient animate-gpt5-pan">
        <Card className="w-full max-w-md rounded-2xl border border-white/40 bg-white/90 backdrop-blur-md shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
              <img src="/lovable-uploads/10e2e94b-0e70-490d-bc29-2f836e6ddf32.png" alt="Padu logo" className="h-8 w-8 rounded-lg" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Update your password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below.
            </CardDescription>
            <div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>We use industry-standard encryption.</span>
            </div>
            {error && (
              <div role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">New password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                {password && (
                  <div className="text-xs">
                    <span className={passwordStrength ? "text-green-600" : "text-amber-600"}>
                      {passwordStrength ? "Strong" : "Needs letter, number, and 8+ characters"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm new password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-9 pr-10 rounded-full shadow-inner focus-ring"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="text-xs">
                    <span className={passwordsMatch ? "text-green-600" : "text-red-600"}>
                      {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !passwordsMatch || !passwordStrength}
                className="w-full"
                variant="hero"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating password...
                  </span>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              After updating, you'll be signed in automatically.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}