import { useState, useEffect } from "react";
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
  activeTab?: "home" | "insights" | "competition" | "ai-agents";
  onTabChange?: (tab: "home" | "insights" | "competition" | "ai-agents") => void;
}

export default function DashboardLayout({ 
  children, 
  activeTab = "home", 
  onTabChange = () => {} 
}: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
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

  const tabs = [
    { id: "home", label: "Home", disabled: false },
    { id: "insights", label: "Insights", disabled: false },
    { id: "competition", label: "Competition", disabled: true, badge: "soon" },
    { id: "ai-agents", label: "AI Agents", disabled: true, badge: "soon" },
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
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 font-bold text-xl">
              <span className="text-slate-900">Padu</span>
              <span className="inline-block h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200/60" />

            {/* Hotel Selector */}
            <Select defaultValue="grand-hotel">
              <SelectTrigger className="w-48 border-none bg-transparent hover:bg-slate-50/80 focus:bg-slate-50/80 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="grand-hotel">Grand Hotel Downtown</SelectItem>
                <SelectItem value="all-properties">All properties</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <div key={tab.id} className="relative">
                {tab.disabled ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className="px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed flex items-center gap-2"
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
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
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
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className={`relative transition-all duration-200 ${searchExpanded ? 'w-64' : 'w-10'}`}>
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" 
              />
              <Input
                placeholder="Search reviews, insights, sources…"
                className={`pl-10 pr-4 py-2 border-slate-200/60 bg-white/70 backdrop-blur-sm transition-all duration-200 ${
                  searchExpanded ? 'w-full opacity-100' : 'w-10 opacity-0 cursor-pointer'
                }`}
                onFocus={() => setSearchExpanded(true)}
                onBlur={() => setSearchExpanded(false)}
                onClick={() => !searchExpanded && setSearchExpanded(true)}
              />
              {!searchExpanded && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full hover:bg-slate-100/80"
                  onClick={() => setSearchExpanded(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100/80">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>

            {/* Help */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100/80">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Help & Documentation</TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100/80 relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-slate-100/80">
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center">
                    {userInitials}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}