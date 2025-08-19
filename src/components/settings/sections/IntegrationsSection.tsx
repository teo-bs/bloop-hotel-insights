import { useState } from "react";
import { Plug2, RefreshCw, Settings as SettingsIcon, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: "connected" | "disconnected" | "syncing";
  lastSync?: string;
  reviewCount?: number;
}

const integrations: Integration[] = [
  {
    id: "google",
    name: "Google Business",
    description: "Import reviews from Google My Business profiles",
    logo: "/logos/google.svg",
    status: "connected",
    lastSync: "2024-01-19T10:30:00Z",
    reviewCount: 1234,
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    description: "Sync reviews from TripAdvisor properties",
    logo: "/logos/tripadvisor.svg",
    status: "connected",
    lastSync: "2024-01-19T09:15:00Z",
    reviewCount: 856,
  },
  {
    id: "booking",
    name: "Booking.com",
    description: "Import guest reviews from Booking.com",
    logo: "/logos/booking.svg",
    status: "disconnected",
  },
  {
    id: "expedia",
    name: "Expedia",
    description: "Connect to Expedia Group properties",
    logo: "/logos/tripadvisor.svg", // Placeholder
    status: "disconnected",
  },
];

export default function IntegrationsSection() {
  const [syncing, setSyncing] = useState<string>("");
  const { toast } = useToast();

  const handleConnect = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Integration connected",
        description: "Successfully connected to the integration.",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to the integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing("");
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      // Simulate disconnection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Integration disconnected",
        description: "Successfully disconnected from the integration.",
      });
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description: "Failed to disconnect from the integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing("");
    }
  };

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Sync completed",
        description: "Successfully synchronized data from the integration.",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing("");
    }
  };

  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "disconnected":
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Live</Badge>;
      case "syncing":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Syncing</Badge>;
      case "disconnected":
        return <Badge variant="secondary">Not connected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Plug2 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
        </div>
        <p className="text-slate-600">
          Connect Google, Tripadvisor, Booking.com, and more.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2">
                    <img
                      src={integration.logo}
                      alt={integration.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(syncing === integration.id ? "syncing" : integration.status)}
                      {getStatusBadge(syncing === integration.id ? "syncing" : integration.status)}
                    </div>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">
                {integration.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {integration.status === "connected" && integration.lastSync && (
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Last sync:</span> {formatLastSync(integration.lastSync)}
                  </div>
                  {integration.reviewCount && (
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Reviews:</span> {integration.reviewCount.toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {integration.status === "disconnected" && (
                <div className="mb-4">
                  <p className="text-sm text-slate-500">
                    Connect a source to start consolidating reviews.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {integration.status === "connected" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleSync(integration.id)}
                      disabled={syncing === integration.id}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                      {syncing === integration.id ? "Syncing..." : "Sync Now"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(integration.id)}
                      disabled={syncing === integration.id}
                    >
                      Disconnect
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={syncing === integration.id}
                    >
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleConnect(integration.id)}
                    disabled={syncing === integration.id}
                    className="min-w-[80px]"
                  >
                    {syncing === integration.id ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State for Disconnected */}
      {integrations.every(i => i.status === "disconnected") && (
        <Card>
          <CardContent className="text-center py-12">
            <Plug2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No integrations connected</h3>
            <p className="text-slate-600 mb-4">
              Connect a source to start consolidating reviews.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}