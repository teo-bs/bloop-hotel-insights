import { Building2, CreditCard, Users, Plug2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MainSettingsCardsProps {
  onSectionChange: (section: string, subsection?: string) => void;
}

const settingsCards = [
  {
    id: "organization",
    subsection: "details",
    icon: Building2,
    title: "Organization",
    description: "Manage your hotel's name, logo, and contact details.",
  },
  {
    id: "organization",
    subsection: "billing",
    icon: CreditCard,
    title: "Billing & payments",
    description: "Payment methods, invoices, subscriptions.",
  },
  {
    id: "organization",
    subsection: "groups",
    icon: Users,
    title: "Groups",
    description: "Organize properties into groups for easier management.",
  },
  {
    id: "integrations",
    icon: Plug2,
    title: "Integrations",
    description: "Connect Google, Tripadvisor, Booking.com, and more.",
  },
];

export default function MainSettingsCards({ onSectionChange }: MainSettingsCardsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Quick access to main settings
        </h1>
        <p className="text-slate-600">
          We've curated the most commonly used so you can find what you need — fast.
        </p>
      </div>

      {/* Cards Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={`${card.id}-${card.subsection || "main"}`}
              className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl group"
              onClick={() => onSectionChange(card.id, card.subsection)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}