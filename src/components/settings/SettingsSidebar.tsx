import { useState, useMemo } from "react";
import { Search, ChevronRight, ChevronDown, Building2, CreditCard, Users, Plug2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  children?: MenuItem[];
  isGroup?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: "main",
    label: "Main settings",
    icon: Building2,
  },
  {
    id: "organization",
    label: "Organization",
    icon: Building2,
    isGroup: true,
    children: [
      { id: "details", label: "Details" },
      { id: "billing", label: "Billing & payments" },
      { id: "groups", label: "Groups" },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug2,
  },
];

interface SettingsSidebarProps {
  activeSection: string;
  activeSubsection: string;
  onSectionChange: (section: string, subsection?: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SettingsSidebar({
  activeSection,
  activeSubsection,
  onSectionChange,
  searchQuery,
  onSearchChange,
}: SettingsSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["organization"]));

  // Filter menu items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;

    const searchLower = searchQuery.toLowerCase();
    return menuItems.filter((item) => {
      if (item.label.toLowerCase().includes(searchLower)) return true;
      if (item.children) {
        return item.children.some((child) =>
          child.label.toLowerCase().includes(searchLower)
        );
      }
      return false;
    });
  }, [searchQuery]);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const isActive = (itemId: string, subsectionId?: string) => {
    if (subsectionId) {
      return activeSection === itemId && activeSubsection === subsectionId;
    }
    return activeSection === itemId && !activeSubsection;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const Icon = item.icon;
    const isExpanded = expandedGroups.has(item.id);
    const hasActiveChild = item.children?.some((child) =>
      isActive(item.id, child.id)
    );

    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left h-auto p-3 font-normal transition-all duration-200",
            level === 0 ? "text-sm" : "text-sm pl-8",
            isActive(item.id) || hasActiveChild
              ? "bg-primary/10 text-primary font-medium shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80",
            item.isGroup && "font-medium"
          )}
          onClick={() => {
            if (item.isGroup) {
              toggleGroup(item.id);
            } else if (level > 0) {
              onSectionChange("organization", item.id);
            } else {
              onSectionChange(item.id);
            }
          }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
              <span>{item.label}</span>
            </div>
            {item.children && (
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        </Button>

        {/* Render children if expanded */}
        {item.children && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl p-6">
      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <Input
          placeholder="Search settings…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-slate-200/60 bg-white/70 backdrop-blur-sm"
        />
      </div>

      {/* Menu Items */}
      <nav className="space-y-1">
        {filteredItems.map((item) => renderMenuItem(item))}
      </nav>
    </div>
  );
}