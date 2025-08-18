import { Routes, Route, Navigate } from "react-router-dom";
import { isAppSubdomain, redirectToApp, redirectToRoot } from "@/utils/domain";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AuthGuard from "@/components/auth/AuthGuard";
import AuthCallback from "@/pages/AuthCallback";
import UpdatePasswordPage from "@/pages/UpdatePassword";
import NewDashboard from "@/pages/NewDashboard";
import UploadPage from "@/pages/Upload";
import ReviewsPage from "@/pages/Reviews";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LandingLayout from "@/components/layout/LandingLayout";

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
        
        {/* Redirect bare app subdomain to dashboard */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected app routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <NewDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <AppLayout>
                <UploadPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ReviewsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div className="p-8 text-center text-muted-foreground">Insights page coming soon...</div>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div className="p-8 text-center text-muted-foreground">Reports page coming soon...</div>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div className="p-8 text-center text-muted-foreground">Settings page coming soon...</div>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
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
  // Perform the redirect
  redirectToApp(path);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gpt5-gradient animate-gpt5-pan">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to app...</p>
      </div>
    </div>
  );
}