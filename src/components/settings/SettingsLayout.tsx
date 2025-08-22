import { useState } from "react";
import SettingsSidebar from "./SettingsSidebar";
import SettingsContent from "./SettingsContent";

interface SettingsLayoutProps {
  activeSection: string;
  activeSubsection: string;
  onSectionChange: (section: string, subsection?: string) => void;
}

export default function SettingsLayout({
  activeSection,
  activeSubsection,
  onSectionChange,
}: SettingsLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gpt5-gradient animate-gpt5-pan">
      <div className="container mx-auto px-4 md:px-6 xl:px-8 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Responsive */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <SettingsSidebar
                activeSection={activeSection}
                activeSubsection={activeSubsection}
                onSectionChange={onSectionChange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            <SettingsContent
              activeSection={activeSection}
              activeSubsection={activeSubsection}
              onSectionChange={onSectionChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}