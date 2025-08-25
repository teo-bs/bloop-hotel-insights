import { useState, useEffect } from "react";
import AuthModal from "./auth/AuthModal";
import IntegrationsModal from "./integrations/IntegrationsModal";
import CSVUploadModal from "./integrations/CSVUploadModal";
import WaitlistModal from "./waitlist/WaitlistModal";
import type { Platform } from "@/stores/integrations";

export default function GlobalActions() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [authIntent, setAuthIntent] = useState<any>(null);
  const [integrationsModalOpen, setIntegrationsModalOpen] = useState(false);
  const [csvUploadModalOpen, setCsvUploadModalOpen] = useState(false);
  const [csvUploadPlatform, setCsvUploadPlatform] = useState<Platform | null>(null);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);

  useEffect(() => {
    const handleAuthModalOpen = (e: CustomEvent) => {
      const { mode = 'signin', intent = null } = e.detail || {};
      setAuthMode(mode);
      setAuthIntent(intent);
      setAuthModalOpen(true);
    };

    const handleIntegrationsModalOpen = () => setIntegrationsModalOpen(true);
    const handleCsvUploadModalOpen = (e: CustomEvent) => {
      const { platform } = e.detail || {};
      setCsvUploadPlatform(platform);
      setCsvUploadModalOpen(true);
    };
    const handleWaitlistModalOpen = () => setWaitlistModalOpen(true);

    document.addEventListener("auth:open", handleAuthModalOpen as EventListener);
    document.addEventListener("integrations:open", handleIntegrationsModalOpen);
    document.addEventListener("csv-upload:open", handleCsvUploadModalOpen as EventListener);
    document.addEventListener("open-csv-upload-modal", handleCsvUploadModalOpen as EventListener);
    document.addEventListener("waitlist:open", handleWaitlistModalOpen);

    return () => {
      document.removeEventListener("auth:open", handleAuthModalOpen as EventListener);
      document.removeEventListener("integrations:open", handleIntegrationsModalOpen);
      document.removeEventListener("csv-upload:open", handleCsvUploadModalOpen as EventListener);
      document.removeEventListener("open-csv-upload-modal", handleCsvUploadModalOpen as EventListener);
      document.removeEventListener("waitlist:open", handleWaitlistModalOpen);
    };
  }, []);

  return (
    <>
      <WaitlistModal 
        open={waitlistModalOpen} 
        onOpenChange={setWaitlistModalOpen} 
      />
      <CSVUploadModal
        platform={csvUploadPlatform}
        open={csvUploadModalOpen}
        onOpenChange={setCsvUploadModalOpen}
      />
    </>
  );
}
