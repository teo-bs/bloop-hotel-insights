
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Upload } from "lucide-react";
import CSVImportModal from "@/components/upload/CSVImportModal";

export default function UploadPage() {
  const [showImportModal, setShowImportModal] = useState(false);
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 md:px-6 xl:px-8 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Import Reviews</h1>
            <p className="text-muted-foreground">
              Upload your review data with our comprehensive CSV import tool
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-8">
            <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Ready to import your reviews?</h2>
            <p className="text-muted-foreground mb-6">
              Our import tool supports template downloads, column mapping, validation, and chunked uploads for the best experience.
            </p>
            <Button 
              onClick={() => setShowImportModal(true)}
              size="lg"
              className="w-full max-w-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Start CSV Import
            </Button>
          </div>
        </div>
      </div>

      <CSVImportModal 
        open={showImportModal} 
        onOpenChange={setShowImportModal}
      />
    </DashboardLayout>
  );
}
