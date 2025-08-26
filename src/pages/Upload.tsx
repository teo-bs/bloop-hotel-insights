import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Download, FileText, Shield, Info } from "lucide-react";
import CSVUploadModal from "@/components/integrations/CSVUploadModal";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UploadPage() {
  const [showImportModal, setShowImportModal] = useState(false);
  const { user } = useAuth();

  const downloadTemplate = () => {
    const headers = [
      "provider",
      "external_review_id", 
      "rating",
      "text",
      "language",
      "date",
      "title",
      "response_text",
      "responded_at"
    ];
    
    const sampleData = [
      [
        "google",
        "ChZDSUhNMG9nS0VJQ0FnSUQyM3F6bEVnEAE",
        "5",
        "Excellent service and amazing food! Highly recommend this hotel.",
        "en", 
        "2024-01-15",
        "Great Experience",
        "Thank you for your wonderful review!",
        "2024-01-16T10:30:00Z"
      ],
      [
        "tripadvisor",
        "598765432",
        "4", 
        "Good location and clean rooms. Staff was very friendly.",
        "en",
        "2024-01-10",
        "Nice Stay",
        "",
        ""
      ]
    ];

    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'padu_reviews_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 md:px-6 xl:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Import Reviews (CSV)</h1>
            <p className="text-muted-foreground">
              Upload your review data with our comprehensive CSV import tool
            </p>
          </div>
          
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                CSV Template
              </CardTitle>
              <CardDescription>
                Download our template to ensure your data is properly formatted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">padu_reviews_template.csv</span>
                  <Badge variant="outline" className="text-xs">
                    Required Headers
                  </Badge>
                </div>
                <Button 
                  onClick={downloadTemplate}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* File Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Import
              </CardTitle>
              <CardDescription>
                Upload your CSV file to import review data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to import your reviews?</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Our import tool supports column mapping, validation, and progress tracking for the best experience.
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
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-sm">Column Mapping</p>
                    <p className="text-xs text-muted-foreground">Map CSV columns to database fields</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-sm">Data Validation</p>
                    <p className="text-xs text-muted-foreground">Real-time validation with error reporting</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-sm">Chunked Upload</p>
                    <p className="text-xs text-muted-foreground">Process large files efficiently</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-sm">Duplicate Detection</p>
                    <p className="text-xs text-muted-foreground">Automatic handling of duplicate reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Your data is processed securely and never shared with third parties.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• All uploads are encrypted in transit</p>
                  <p>• Files are processed and immediately discarded</p>
                  <p>• Only final review data is stored</p>
                  <p>• Full GDPR compliance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CSVUploadModal 
        platform={null}
        open={showImportModal} 
        onOpenChange={setShowImportModal}
      />
    </DashboardLayout>
  );
}