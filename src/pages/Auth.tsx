
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const redirectTo = location.state?.from?.pathname ?? "/dashboard";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("mode");
    if (m === "signup" || m === "signin") {
      setMode(m as "signin" | "signup");
    }
  }, [location.search]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("[Auth] submitting", mode, email);
    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error, data } = await action;
    setLoading(false);

    if (error) {
      console.error("[Auth] error", error);
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: mode === "signin" ? "Signed in!" : "Signed up!",
      description: mode === "signin" ? "Welcome back." : "Check your email if confirmation is required.",
    });
    console.log("[Auth] success", data);
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10 bg-royal-diagonal animate-fade-in">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{mode === "signin" ? "Sign in" : "Create an account"}</CardTitle>
          <CardDescription>Use email and password to {mode === "signin" ? "continue" : "get started"}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <button className="underline" onClick={() => setMode("signup")}>Need an account? Sign up</button>
            ) : (
              <button className="underline" onClick={() => setMode("signin")}>Already have an account? Sign in</button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

