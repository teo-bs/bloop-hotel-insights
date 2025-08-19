import { useState, useEffect } from "react";
import AuthModal from "./auth/AuthModal";
import IntegrationsModal from "./integrations/IntegrationsModal";
import CSVUploadModal from "./upload/CSVUploadModal";
import WaitlistModal from "./waitlist/WaitlistModal";

export default function GlobalActions() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [authIntent, setAuthIntent] = useState<any>(null);
  const [integrationsModalOpen, setIntegrationsModalOpen] = useState(false);
  const [csvUploadModalOpen, setCsvUploadModalOpen] = useState(false);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);

  useEffect(() => {
    const handleAuthModalOpen = (e: CustomEvent) => {
      const { mode = 'signin', intent = null } = e.detail || {};
      setAuthMode(mode);
      setAuthIntent(intent);
      setAuthModalOpen(true);
    };

    const handleIntegrationsModalOpen = () => setIntegrationsModalOpen(true);
    const handleCsvUploadModalOpen = () => setCsvUploadModalOpen(true);
    const handleWaitlistModalOpen = () => setWaitlistModalOpen(true);

    document.addEventListener("auth:open", handleAuthModalOpen as EventListener);
    document.addEventListener("integrations:open", handleIntegrationsModalOpen);
    document.addEventListener("csv-upload:open", handleCsvUploadModalOpen);
    document.addEventListener("waitlist:open", handleWaitlistModalOpen);

    return () => {
      document.removeEventListener("auth:open", handleAuthModalOpen as EventListener);
      document.removeEventListener("integrations:open", handleIntegrationsModalOpen);
      document.removeEventListener("csv-upload:open", handleCsvUploadModalOpen);
      document.removeEventListener("waitlist:open", handleWaitlistModalOpen);
    };
  }, []);

  return null;
}
