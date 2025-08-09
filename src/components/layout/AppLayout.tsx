import { PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export default function AppLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();

  return (
    <SidebarProvider id="app-layout" className="md:grid md:grid-cols-[15rem_1fr]" style={{ ["--sidebar-width" as any]: "15rem", ["--sidebar-width-icon" as any]: "4.5rem" }}>
      <AppSidebar />
      <SidebarInset className="min-h-screen">
        {/* Sticky header inside content */}
        <header id="app-header" className="sticky top-0 z-40 bg-background/70 backdrop-blur border-b">
          <div className="px-6 md:px-8 xl:px-10 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="text-sm text-muted-foreground">Overview</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/upload')}>New Upload</Button>
              <Button variant="hero" onClick={() => navigate('/dashboard')}>Refresh</Button>
            </div>
          </div>
        </header>

        <div id="app-content" className="px-6 md:px-8 xl:px-10 py-6 md:py-8 xl:py-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
