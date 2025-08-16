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
import { redirectToRoot } from "@/utils/domain";

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
      className="bg-white/90 backdrop-blur-md border-r border-white/40 transition-[width] duration-200 ease-out"
      style={{
        ["--sidebar-width" as any]: "15rem",
        ["--sidebar-width-icon" as any]: "4.5rem",
      }}
    >
      <SidebarContent className="p-4">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
              {state !== "collapsed" && <span>Padu</span>}
            </div>
            <button
              id="btn-sidebar-toggle"
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Toggle sidebar"
              aria-controls="app-sidebar"
              aria-expanded={state !== "collapsed"}
            >
              {state === "collapsed" ? (
                <ChevronRight className="h-4 w-4 text-slate-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              )}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-2">
            {items.map(({ id, route, label, Icon }) => {
              const active = currentRoute === route;
              const baseCls =
                "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ";
              const stateCls = active
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-slate-700 hover:bg-slate-100/70";

              const linkEl = (
                <a
                  key={id}
                  id={id}
                  href={`#${route}`}
                  title={label}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onRouteChange(route);
                  }}
                  className={baseCls + stateCls}
                >
                  <Icon className="h-4 w-4" />
                  <span className={state === "collapsed" ? "hidden" : "block"}>{label}</span>
                </a>
              );

              return state === "collapsed" ? (
                <Tooltip key={id}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              ) : (
                linkEl
              );
            })}
          </nav>

          {/* Footer user + logout */}
          <div className="mt-4 border-t border-slate-200/60 pt-4">
            {state === "collapsed" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div id="sidebar-user" className="h-8 w-8 rounded-full bg-slate-200 grid place-items-center text-xs font-bold select-none text-slate-700">
                    {String(name).charAt(0).toUpperCase()}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">{name}</TooltipContent>
              </Tooltip>
            ) : (
              <div id="sidebar-user" className="flex items-center gap-3 rounded-full px-4 py-3 bg-slate-50">
                <div className="h-8 w-8 rounded-full bg-slate-200 grid place-items-center text-xs font-bold select-none text-slate-700">
                  {String(name).charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-medium truncate text-slate-900">{name}</div>
              </div>
            )}
            <Button variant="ghost" className="justify-start w-full mt-2 text-slate-600 hover:bg-slate-100/70 rounded-full" onClick={async () => { 
              await supabase.auth.signOut(); 
              redirectToRoot('/');
            }}>
              <LogOut className="h-4 w-4 mr-2" />
              {state === "collapsed" ? <span className="hidden">Log out</span> : "Log out"}
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
