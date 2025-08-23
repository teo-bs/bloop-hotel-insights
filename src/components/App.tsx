import React from "react";
import CSVUploadModal from "@/components/integrations/CSVUploadModal";
import ManageIntegrationModal from "@/components/integrations/ManageIntegrationModal";

export default function AppRoot() {
  return (
    <>
      {/* Global modals */}
      <CSVUploadModal open={false} onOpenChange={() => {}} />
      <ManageIntegrationModal open={false} onOpenChange={() => {}} />
    </>
  );
}