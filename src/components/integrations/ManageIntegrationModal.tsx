import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Platform } from "@/stores/integrations";
import { formatDistanceToNow } from "date-fns";

interface ManageIntegrationModalProps {
  platform?: Platform;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLATFORM_CONFIG = {
  google: {
    name: "Google Business",
    logo: "/logos/google.svg"
  },
  tripadvisor: {
    name: "TripAdvisor", 
    logo: "/logos/tripadvisor.svg"
  },
  booking: {
    name: "Booking.com",
    logo: "/logos/booking.svg"
  }
};

export default function ManageIntegrationModal({ 
  platform, 
  open, 
  onOpenChange 
}: ManageIntegrationModalProps) {
  const { toast } = useToast();
  const [autoSync, setAutoSync] = useState(true);
  const [includeReplies, setIncludeReplies] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>("Main Location");

  // Listen for modal open events
  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      if (event.detail?.platform) {
        onOpenChange(true);
      }
    };

    window.addEventListener('open-manage-integration-modal', handleOpenModal as EventListener);
    return () => window.removeEventListener('open-manage-integration-modal', handleOpenModal as EventListener);
  }, [onOpenChange]);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your integration settings have been updated.",
    });
    onOpenChange(false);
  };

  const handleChangeLocation = () => {
    // Open location picker modal (to be implemented)
    toast({
      title: "Coming soon",
      description: "Location selection will be available soon.",
    });
  };

  const handleUploadNew = () => {
    window.dispatchEvent(new CustomEvent('open-csv-upload-modal', { detail: { platform } }));
    onOpenChange(false);
  };

  if (!platform) return null;

  const config = PLATFORM_CONFIG[platform];
  const lastSync = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={config.logo} alt={config.name} className="h-6 w-6" />
            Manage {config.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Current Status
                <Badge variant="default" className="bg-success/10 text-success border-success/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Connection Type</span>
                <span className="font-medium">Manual (CSV)</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Upload</span>
                <span className="font-medium">
                  {formatDistanceToNow(lastSync, { addSuffix: true })}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Reviews</span>
                <span className="font-medium">1,234</span>
              </div>

              <Separator />

              {selectedLocation && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleChangeLocation}
                    >
                      Change
                    </Button>
                  </div>
                  <div className="text-sm font-medium pl-6">
                    {selectedLocation}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync" className="text-sm font-medium">
                    Auto-sync daily
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically check for new reviews daily
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-replies" className="text-sm font-medium">
                    Include replies
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Import business replies to reviews
                  </p>
                </div>
                <Switch
                  id="include-replies"
                  checked={includeReplies}
                  onCheckedChange={setIncludeReplies}
                />
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Data Management</h3>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleUploadNew}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New CSV
            </Button>
            <p className="text-xs text-muted-foreground">
              Upload a new CSV file to update your reviews. This will merge with existing data.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}