import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SettingsLayout from "@/components/settings/SettingsLayout";

export default function Settings() {
  const { section, subsection } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("main");
  const [activeSubsection, setActiveSubsection] = useState<string>("");

  useEffect(() => {
    if (section) {
      setActiveSection(section);
      setActiveSubsection(subsection || "");
    } else {
      setActiveSection("main");
      setActiveSubsection("");
    }
  }, [section, subsection]);

  const handleSectionChange = (newSection: string, newSubsection?: string) => {
    setActiveSection(newSection);
    setActiveSubsection(newSubsection || "");
    
    if (newSection === "main") {
      navigate("/settings");
    } else if (newSubsection) {
      navigate(`/settings/${newSection}/${newSubsection}`);
    } else {
      navigate(`/settings/${newSection}`);
    }
  };

  return (
    <DashboardLayout>
      <SettingsLayout
        activeSection={activeSection}
        activeSubsection={activeSubsection}
        onSectionChange={handleSectionChange}
      />
    </DashboardLayout>
  );
}