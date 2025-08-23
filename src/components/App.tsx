import React, { useState, useEffect } from "react";
import CSVUploadModal from "@/components/integrations/CSVUploadModal";
import ManageIntegrationModal from "@/components/integrations/ManageIntegrationModal";
import type { Platform } from "@/stores/integrations";

export default function AppRoot() {
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvModalPlatform, setCsvModalPlatform] = useState<Platform | null>(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [manageModalPlatform, setManageModalPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    const handleOpenCsvModal = (event: CustomEvent<{ platform: Platform }>) => {
      setCsvModalPlatform(event.detail.platform);
      setCsvModalOpen(true);
    };

    const handleOpenManageModal = (event: CustomEvent<{ platform: Platform }>) => {
      setManageModalPlatform(event.detail.platform);
      setManageModalOpen(true);
    };

    window.addEventListener('open-csv-upload-modal', handleOpenCsvModal as EventListener);
    window.addEventListener('open-manage-integration-modal', handleOpenManageModal as EventListener);

    return () => {
      window.removeEventListener('open-csv-upload-modal', handleOpenCsvModal as EventListener);
      window.removeEventListener('open-manage-integration-modal', handleOpenManageModal as EventListener);
    };
  }, []);

  return (
    <>
      {/* Global modals */}
      <CSVUploadModal 
        open={csvModalOpen} 
        onOpenChange={setCsvModalOpen}
        platform={csvModalPlatform}
      />
      <ManageIntegrationModal 
        open={manageModalOpen} 
        onOpenChange={setManageModalOpen}
        platform={manageModalPlatform}
      />
    </>
  );
}