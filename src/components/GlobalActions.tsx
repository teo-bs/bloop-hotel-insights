import { useEffect } from "react";
import { openIntegrationsModal, openCsvUploadModal } from "@/lib/actions";

export default function GlobalActions() {
  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as Element | null;
      if (!target) return;

      const integrationsTrigger = target.closest(
        "#btn-connect-sources-header, #cta-connect-sources"
      );
      if (integrationsTrigger) {
        e.preventDefault();
        openIntegrationsModal();
        return;
      }

      const csvTrigger = target.closest(
        "#btn-upload-csv-header, #btn-upload-csv"
      );
      if (csvTrigger) {
        e.preventDefault();
        openCsvUploadModal();
        return;
      }
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  return null;
}
