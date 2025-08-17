import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuthRedirectUrl } from '@/lib/auth-config';
import { resumePendingAfterAuth } from '@/lib/savePreview';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Handle auth success and redirects
  const handleAuthSuccess = async () => {
    try {
      // Check for pending actions
      const pending = localStorage.getItem("padu.pending");
      if (pending) {
        try {
          const pendingData = JSON.parse(pending);
          if (pendingData?.type === "savePreview") {
            await resumePendingAfterAuth();
            localStorage.removeItem("padu.pending");
            return;
          }
        } catch (e) {
          console.error("Error processing pending action:", e);
        }
        localStorage.removeItem("padu.pending");
      }

      // Check for next parameter in URL
      const params = new URLSearchParams(location.search);
      const next = params.get('next');
      
      if (next && next.startsWith('/')) {
        navigate(next, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error("Error handling auth success:", error);
      navigate('/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          // Dispatch success event for any listening components
          document.dispatchEvent(new CustomEvent("auth:success"));
          
          // Only handle redirect if we're on an auth page
          if (location.pathname.startsWith('/auth') && location.pathname !== '/auth/callback') {
            await handleAuthSuccess();
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [location.pathname, navigate]);

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { error: new Error("Incorrect email or password.") };
        }
        return { error };
      }
      toast({ title: "Welcome back 👋", description: "You're signed in." });
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
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
          return { error: new Error("Account exists via Google—use Continue with Google or reset your password.") };
        }
        return { error };
      }
      toast({ title: "Account created. You're all set.", description: "Welcome to Padu!" });
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getAuthRedirectUrl() }
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Redirect to landing page on root domain
      const { redirectToRoot } = await import("@/utils/domain");
      redirectToRoot('/');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithPassword,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}