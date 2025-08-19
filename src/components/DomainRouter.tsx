import { Routes, Route, Navigate } from "react-router-dom";
import { isAppSubdomain, redirectToApp, redirectToRoot } from "@/utils/domain";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AuthGuard from "@/components/auth/AuthGuard";
import AuthCallback from "@/pages/AuthCallback";
import UpdatePasswordPage from "@/pages/UpdatePassword";
import Dashboard from "@/pages/Dashboard";
import UploadPage from "@/pages/Upload";
import ReviewsPage from "@/pages/Reviews";
import Settings from "@/pages/Settings";
import WaitlistPreview from "@/pages/WaitlistPreview";
import AdminWaitlist from "@/pages/AdminWaitlist";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LandingLayout from "@/components/layout/LandingLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";

/**
 * Router that handles domain-based routing
 * - Root domain: Landing page only
 * - App subdomain: Authenticated app routes
 */
export default function DomainRouter() {
  const isApp = isAppSubdomain();

  if (isApp) {
    // App subdomain routes
    return (
      <Routes>
        {/* Auth routes available on app subdomain */}
        <Route path="/auth" element={<AuthGuard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
        
        {/* Waitlist mode - preview page */}
        <Route path="/waitlist-preview" element={<WaitlistPreview />} />
        <Route path="/admin/waitlist" element={<ProtectedRoute><AdminWaitlist /></ProtectedRoute>} />
        
        {/* Redirect all app routes to waitlist preview */}
        <Route path="/" element={<Navigate to="/waitlist-preview" replace />} />
        <Route path="/dashboard" element={<Navigate to="/waitlist-preview" replace />} />
        <Route path="/upload" element={<Navigate to="/waitlist-preview" replace />} />
        <Route path="/reviews" element={<Navigate to="/waitlist-preview" replace />} />
        <Route path="/insights" element={<Navigate to="/waitlist-preview" replace />} />
        <Route path="/reports" element={<Navigate to="/waitlist-preview" replace />} />
        <Route path="/settings" element={<Navigate to="/waitlist-preview" replace />} />
        <Route path="/settings/:section" element={<Navigate to="/waitlist-preview" replace />} />
        <Route path="/settings/:section/:subsection" element={<Navigate to="/waitlist-preview" replace />} />
        
        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  } else {
    // Root domain routes
    return (
      <Routes>
        {/* Landing page */}
        <Route 
          path="/" 
          element={
            <LandingLayout>
              <Index />
            </LandingLayout>
          } 
        />
        
        {/* Auth callback can be on root domain as fallback */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Redirect any app routes to app subdomain */}
        <Route 
          path="/dashboard" 
          element={<RedirectToApp path="/dashboard" />} 
        />
        <Route 
          path="/app/*" 
          element={<RedirectToApp path="/dashboard" />} 
        />
        <Route 
          path="/upload" 
          element={<RedirectToApp path="/upload" />} 
        />
        <Route 
          path="/reviews" 
          element={<RedirectToApp path="/reviews" />} 
        />
        <Route 
          path="/insights" 
          element={<RedirectToApp path="/insights" />} 
        />
        <Route 
          path="/reports" 
          element={<RedirectToApp path="/reports" />} 
        />
        <Route 
          path="/settings" 
          element={<RedirectToApp path="/settings" />} 
        />
        
        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }
}

/**
 * Component that redirects to the app subdomain
 */
function RedirectToApp({ path }: { path: string }) {
  const hostname = window.location.hostname;
  
  // In Lovable environment, just navigate without redirect
  if (hostname.includes('lovableproject.com')) {
    window.location.href = path;
  } else {
    // Perform the redirect for non-Lovable environments
    redirectToApp(path);
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gpt5-gradient animate-gpt5-pan">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to app...</p>
      </div>
    </div>
  );
}