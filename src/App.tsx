
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import GlobalActions from "./components/GlobalActions";
import IntegrationsModal from "@/components/integrations/IntegrationsModal";
import CSVUploadModal from "@/components/integrations/CSVUploadModal";
import AuthModal from "@/components/auth/AuthModal";
import DomainRouter from "@/components/DomainRouter";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GlobalActions />
      <BrowserRouter>
        <AuthProvider>
          {/* Global modals */}
          <AuthModal />
          <IntegrationsModal />
          
          {/* Domain-aware routing */}
          <DomainRouter />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

