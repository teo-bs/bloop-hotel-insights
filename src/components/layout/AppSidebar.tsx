import { useNavigate } from "react-router-dom";
import { LayoutDashboard, UploadCloud, LineChart, LogOut, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar({ currentRoute, onRouteChange }: { currentRoute: "dashboard" | "reviews" | "insights" | "reports" | "settings"; onRouteChange: (r: "dashboard" | "reviews" | "insights" | "reports" | "settings") => void; }) {
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const name = (user?.user_metadata as any)?.name || user?.email || "User";

  const items = [
    { id: "nav-dashboard", route: "dashboard" as const, label: "Dashboard", Icon: LayoutDashboard },
    { id: "nav-reviews", route: "reviews" as const, label: "Reviews", Icon: UploadCloud },
    { id: "nav-insights", route: "insights" as const, label: "Insights", Icon: LineChart },
    { id: "nav-reports", route: "reports" as const, label: "Reports", Icon: LineChart },
    { id: "nav-settings", route: "settings" as const, label: "Settings", Icon: Settings },
  ];

  return (
    <Sidebar
      id="app-sidebar"
      collapsible="icon"
      className="rounded-r-2xl"
      style={{
        ["--sidebar-width" as any]: "15rem",
        ["--sidebar-width-icon" as any]: "4.5rem",
        ["--sidebar-background" as any]: "214 82% 50%",
        ["--sidebar-foreground" as any]: "0 0% 100%",
      }}
    >
      <SidebarContent className="p-4">
        <div className="relative h-full flex flex-col text-primary-foreground">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-r-2xl" aria-hidden="true" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              {state !== "collapsed" && <span>Padu</span>}
            </div>
            <button
              id="btn-sidebar-toggle"
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-white/10"
              aria-label="Toggle sidebar"
            >
              {state === "collapsed" ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {items.map(({ id, route, label, Icon }) => {
              const active = currentRoute === route;
              return (
                <a
                  key={id}
                  id={id}
                  href={`#${route}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onRouteChange(route);
                  }}
                  className={
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition " +
                    (active
                      ? "font-bold text-primary-foreground border-l-4 border-accent pl-2 -ml-1 bg-white/5"
                      : "text-primary-foreground/90 hover:bg-white/10 border-l-4 border-transparent pl-3")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className={state === "collapsed" ? "hidden" : "block"}>{label}</span>
                </a>
              );
            })}
          </nav>

          {/* Footer user + logout */}
          <div className="mt-4 border-t border-white/10 pt-3">
            {state === "collapsed" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div id="sidebar-user" className="h-8 w-8 rounded-full bg-white/20 grid place-items-center text-xs font-bold select-none">
                    {String(name).charAt(0).toUpperCase()}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">{name}</TooltipContent>
              </Tooltip>
            ) : (
              <div id="sidebar-user" className="flex items-center gap-3 rounded-md px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center text-xs font-bold select-none">
                  {String(name).charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-medium truncate">{name}</div>
              </div>
            )}
            <Button variant="ghost" className="justify-start w-full mt-2 text-primary-foreground hover:bg-white/10" onClick={async () => { await supabase.auth.signOut(); navigate("/auth?mode=signin", { replace: true }); }}>
              <LogOut className="h-4 w-4 mr-2" />
              {state === "collapsed" ? <span className="hidden">Log out</span> : "Log out"}
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
