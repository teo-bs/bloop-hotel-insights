import MainSettingsCards from "./sections/MainSettingsCards";
import OrganizationDetails from "./sections/OrganizationDetails";
import OrganizationBilling from "./sections/OrganizationBilling";
import OrganizationGroups from "./sections/OrganizationGroups";
import IntegrationsSection from "./sections/IntegrationsSection";

interface SettingsContentProps {
  activeSection: string;
  activeSubsection: string;
  onSectionChange: (section: string, subsection?: string) => void;
}

export default function SettingsContent({
  activeSection,
  activeSubsection,
  onSectionChange,
}: SettingsContentProps) {
  const renderContent = () => {
    if (activeSection === "main") {
      return <MainSettingsCards onSectionChange={onSectionChange} />;
    }

    if (activeSection === "organization") {
      switch (activeSubsection) {
        case "details":
          return <OrganizationDetails />;
        case "billing":
          return <OrganizationBilling />;
        case "groups":
          return <OrganizationGroups />;
        default:
          return <MainSettingsCards onSectionChange={onSectionChange} />;
      }
    }

    if (activeSection === "integrations") {
      return <IntegrationsSection />;
    }

    return <MainSettingsCards onSectionChange={onSectionChange} />;
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
}