
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import GlobalActions from "./components/GlobalActions";
import IntegrationsModal from "@/components/integrations/IntegrationsModal";
import CSVUploadModal from "@/components/upload/CSVUploadModal";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";
import DomainRouter from "@/components/DomainRouter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GlobalActions />
      <BrowserRouter>
        {/* Global modals */}
        <UnifiedAuthModal />
        <IntegrationsModal />
        <CSVUploadModal />
        {/* Domain-aware routing */}
        <DomainRouter />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

