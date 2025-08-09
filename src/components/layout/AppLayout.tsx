import { PropsWithChildren, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Bell } from "lucide-react";
import { openIntegrationsModal, openCsvUploadModal } from "@/lib/actions";

export default function AppLayout({ children }: PropsWithChildren) {
  
  
  type RouteKey = "dashboard" | "reviews" | "insights" | "reports" | "settings";
  const [currentRoute, setCurrentRoute] = useState<RouteKey>("dashboard");

  // Sync from URL hash on mount
  useEffect(() => {
    const hash = (window.location.hash || "").replace("#", "");
    const allowed = new Set(["dashboard", "reviews", "insights", "reports", "settings"]);
    if (allowed.has(hash)) setCurrentRoute(hash as RouteKey);
  }, []);

  // Update hash when state changes
  useEffect(() => {
    window.location.hash = currentRoute;
  }, [currentRoute]);

  return (
    <SidebarProvider id="app-layout" className="md:grid md:grid-cols-[var(--sidebar-width)_1fr] has-[[data-state=collapsed][data-collapsible=icon]]:md:grid-cols-[var(--sidebar-width-icon)_1fr]" style={{ ["--sidebar-width" as any]: "15rem", ["--sidebar-width-icon" as any]: "4.5rem" }}>
      <AppSidebar currentRoute={currentRoute} onRouteChange={setCurrentRoute} />
      <SidebarInset className="min-h-screen">
        {/* Sticky header inside content */}
        <header id="app-header" className="sticky top-0 z-40 bg-background/70 backdrop-blur border-b">
          <div className="px-6 md:px-8 xl:px-10 h-16 grid grid-cols-1 md:grid-cols-3 items-center gap-3">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-3">
              <SidebarTrigger id="btn-mobile-menu" className="md:hidden p-2 rounded-md hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Open menu" />
              <SidebarTrigger className="hidden md:inline-flex" />
              <nav id="breadcrumbs" aria-label="Breadcrumb">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#dashboard">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href={`#${currentRoute}`}>{currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1)}</BreadcrumbLink>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </nav>
            </div>

            {/* Center: Date filter */}
            <div className="hidden md:flex items-center justify-center">
              <div id="global-date-filter" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select defaultValue="90" onValueChange={(v) => {/* expose globally later */}}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Last 90 days" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-2">
              <Button id="btn-upload-csv-header" variant="secondary" onClick={openCsvUploadModal}>Upload CSV</Button>
              <Button id="btn-connect-sources-header" variant="hero" onClick={openIntegrationsModal}>Connect Sources</Button>
              <button className="relative p-2 rounded-md hover:bg-accent/40" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {/* Badge example: */}
                {/* <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive"></span> */}
              </button>
            </div>
          </div>
        </header>

        <div id="state-currentRoute" data-value={currentRoute} className="hidden" />
        <div id="app-content" className="px-6 md:px-8 xl:px-10 py-6 md:py-8 xl:py-10">
          <div key={currentRoute} className="animate-[fade-in_0.18s_ease-out] motion-reduce:animate-none">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
