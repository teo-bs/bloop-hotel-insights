import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Clock, FileText, AlertTriangle, CheckCircle, Loader2, Settings, Trash2, Info } from "lucide-react";
import { useIntegrations, loadIntegrations, disconnectIntegration, openCSVUploadModal, openManageIntegrationModal, type Platform, type Integration } from "@/stores/integrations";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PLATFORM_CONFIG = {
  google: {
    name: "Google Business",
    logo: "/logos/google.svg",
    description: "Import reviews from Google Business Profile"
  },
  tripadvisor: {
    name: "TripAdvisor",
    logo: "/logos/tripadvisor.svg", 
    description: "Import reviews from TripAdvisor"
  },
  booking: {
    name: "Booking.com",
    logo: "/logos/booking.svg",
    description: "Import reviews from Booking.com"
  }
};

function IntegrationCard({ integration }: { integration: Integration }) {
  const { toast } = useToast();
  const platform = integration.platform;
  const config = PLATFORM_CONFIG[platform];

  const getStatusIcon = () => {
    switch (integration.status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "syncing":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (integration.status) {
      case "connected":
        return <Badge variant="default" className="bg-success/10 text-success border-success/20">Manual (CSV)</Badge>;
      case "error":
        return <Badge variant="destructive">Action required</Badge>;
      case "syncing":
        return <Badge variant="secondary">Processing...</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return null;
    }
  };

  const handleUploadCSV = () => {
    openCSVUploadModal(platform);
  };

  const handleManage = () => {
    openManageIntegrationModal(platform);
  };

  const handleDisconnect = async () => {
    try {
      await disconnectIntegration(platform);
      toast({
        title: "Integration disconnected",
        description: `${config.name} has been disconnected. Existing reviews remain in Padu.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect integration",
        variant: "destructive",
      });
    }
  };

  const lastSync = formatLastSync(integration.last_sync_at);

  return (
    <Card className="group relative overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={config.logo} alt={config.name} className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{config.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status-specific content */}
        {integration.status === "not_connected" && (
          <>
            <div className="space-y-3">
              <Button 
                onClick={handleUploadCSV}
                className="w-full"
                size="lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
              
              {platform === "google" && (
                <Button 
                  onClick={() => {
                    // Trigger download template directly
                    const template = {
                      name: "Google Business Profile",
                      filename: "google_reviews_template.csv",
                      headers: ["Date", "Rating", "Review Text", "Review Title", "Author Name", "Platform", "Reply Text", "Reply Date"]
                    };
                    
                    const csvContent = template.headers.join(",") + "\n" + 
                      "2024-01-15,5,\"Excellent service! The staff was incredibly friendly and went above and beyond to make our stay comfortable. The room was spotless and the amenities exceeded our expectations.\",\"Outstanding Experience\",\"Sarah Johnson\",google,\"Thank you so much for your wonderful review! We're thrilled to hear you had such a great experience.\",2024-01-16\n" +
                      "2024-01-14,4,\"Good location and decent facilities. The breakfast was tasty but could use more variety. Overall satisfied with the value for money.\",\"Good value for money\",\"Mike Thompson\",google,\"Thanks for your feedback! We'll definitely consider expanding our breakfast options.\",2024-01-15\n" +
                      "2024-01-13,3,\"Average experience. Room was clean but quite small. Check-in process took longer than expected.\",\"Average stay\",\"Emma Davis\",google,,\n" +
                      "2024-01-12,5,\"Amazing place! Beautiful views, excellent food, and top-notch service. Will definitely come back!\",\"Perfect getaway\",\"David Wilson\",google,\"We're so glad you enjoyed your stay with us! Looking forward to welcoming you back soon.\",2024-01-13";
                    
                    const blob = new Blob([csvContent], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = template.filename;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      Connect via API
                      <Badge variant="secondary" className="ml-2 text-xs">Coming soon</Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>API integration will be available soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {platform === "google" ? "Download the template to see the expected format, then upload your Google Business reviews." : "We'll import your full review history and keep it organized."}
            </p>
          </>
        )}

        {integration.status === "connected" && (
          <>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {lastSync && (
                  <div>
                    <div className="text-muted-foreground">Last upload</div>
                    <div className="font-medium">{lastSync}</div>
                  </div>
                )}
                <div>
                  <div className="text-muted-foreground">Reviews</div>
                  <div className="font-medium">{integration.total_reviews.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleUploadCSV}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New CSV
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleManage}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
              
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="w-full text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      Connect via API
                      <Badge variant="secondary" className="ml-2 text-xs">Coming soon</Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>API integration will be available soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )}

        {integration.status === "error" && (
          <>
            <div className="space-y-3">
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  There was an issue with your last upload. Please try uploading again.
                </p>
              </div>
              <Button 
                onClick={handleUploadCSV}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV Again
              </Button>
            </div>
          </>
        )}

        {integration.status === "syncing" && (
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Processing your CSV upload...</p>
              </div>
            </div>
            <Button disabled className="w-full">
              Processing...
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function IntegrationsSection() {
  const { integrations, loading } = useIntegrations();

  useEffect(() => {
    loadIntegrations();
  }, []);

  if (loading && integrations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const connectedIntegrations = integrations.filter(i => i.status === "connected");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
        <p className="text-muted-foreground">
          Connect your review platforms to import and manage all reviews in one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {connectedIntegrations.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No integrations connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your first platform to start importing reviews.
          </p>
        </div>
      )}
    </div>
  );
}