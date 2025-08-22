import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Settings, HelpCircle, Bell, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const userName = (user?.user_metadata as any)?.name || user?.email?.split('@')[0] || "User";
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-detect active tab from current route
  const getActiveTab = (): "home" | "insights" | "competition" | "ai-agents" => {
    const path = location.pathname;
    if (path === "/dashboard") return "home";
    if (path === "/reviews") return "insights";
    return "home"; // default fallback
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: "home", label: "Home", disabled: false, path: "/dashboard" },
    { id: "insights", label: "Insights", disabled: false, path: "/reviews" },
    { id: "competition", label: "Competition", disabled: true, badge: "soon", path: "#" },
    { id: "ai-agents", label: "AI Agents", disabled: true, badge: "soon", path: "#" },
  ] as const;

  return (
    <div className="min-h-screen bg-gpt5-gradient animate-gpt5-pan">
      {/* Top Navbar */}
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' 
            : 'bg-white/70 backdrop-blur-md border-b border-white/40'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 xl:px-8 h-16 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-2 md:gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
              <img 
                src="/lovable-uploads/048c2a9e-abc8-4951-8a52-70b7d76192f3.png" 
                alt="Padu" 
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg"
              />
              <span className="text-slate-900 hidden sm:block">Padu</span>
            </div>

            {/* Divider - hidden on mobile */}
            <div className="hidden md:block h-6 w-px bg-slate-200/60" />

            {/* Hotel Selector - responsive width */}
            <Select defaultValue="grand-hotel">
              <SelectTrigger className="w-32 sm:w-40 md:w-48 border-none bg-transparent hover:bg-slate-50/80 focus:bg-slate-50/80 transition-colors text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="grand-hotel">Grand Hotel Downtown</SelectItem>
                <SelectItem value="all-properties">All properties</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Center Navigation - Desktop only */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => (
              <div key={tab.id} className="relative">
                {tab.disabled ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className="px-3 xl:px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed flex items-center gap-2"
                        disabled
                      >
                        {tab.label}
                        {tab.badge && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 border-slate-200">
                            {tab.badge}
                          </Badge>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Coming soon</TooltipContent>
                  </Tooltip>
                ) : (
                  <button
                    onClick={() => navigate(tab.path)}
                    className={`px-3 xl:px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
                      activeTab === tab.id
                        ? 'text-primary bg-primary/10 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search - responsive */}
            <div className={`relative transition-all duration-200 ${searchExpanded ? 'w-48 sm:w-64' : 'w-9 md:w-10'}`}>
              <div className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Search className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />
              </div>
              <Input
                placeholder="Search reviews, insights, sources…"
                className={`pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 text-sm border-slate-200/60 bg-white/70 backdrop-blur-sm transition-all duration-200 ${
                  searchExpanded ? 'w-full opacity-100' : 'w-9 md:w-10 opacity-0 cursor-pointer'
                }`}
                onFocus={() => setSearchExpanded(true)}
                onBlur={() => setSearchExpanded(false)}
                onClick={() => !searchExpanded && setSearchExpanded(true)}
              />
              {!searchExpanded && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-0 w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-slate-100/80"
                  onClick={() => setSearchExpanded(true)}
                >
                  <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              )}
            </div>

            {/* Settings - always visible */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-slate-100/80"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>

            {/* Help - hidden on mobile */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-slate-100/80">
                  <HelpCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Help & Documentation</TooltipContent>
            </Tooltip>

            {/* Notifications - responsive */}
            <Button variant="ghost" size="icon" className="w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-slate-100/80 relative">
              <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold hidden md:block">3</span>
              </div>
            </Button>

            {/* Profile Menu - responsive */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-9 w-9 md:h-10 md:w-10 p-0 hover:bg-slate-100/80">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-white text-xs md:text-sm font-semibold flex items-center justify-center">
                    {userInitials}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 md:w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - bottom tabs */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 px-4 py-2 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.slice(0, 2).map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              disabled={tab.disabled}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 touch-target ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/10'
                  : tab.disabled
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-medium">{tab.label}</div>
              {'badge' in tab && tab.badge && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 border-slate-200">
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}