"use client";

import { BarChart3, Briefcase, User } from "lucide-react";
import { useLanguage } from "@/lib/language/context";

type SidebarSection = "dashboard" | "applications" | "profile";

interface MobileBottomNavProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
}

export default function MobileBottomNav({ activeSection, onSectionChange }: MobileBottomNavProps) {
  const { t } = useLanguage();

  const navItems: Array<{
    id: SidebarSection;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "dashboard", icon: BarChart3 },
    { id: "applications", icon: Briefcase },
    { id: "profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 dark:bg-card/95 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200
                ${isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <Icon
                className={`
                  w-6 h-6 transition-all duration-200
                  ${isActive ? "scale-110" : "scale-100"}
                `}
              />
              <span className={`text-[10px] font-medium ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}>
                {item.id === "dashboard" && t("sidebar.dashboard")}
                {item.id === "applications" && t("sidebar.applications")}
                {item.id === "profile" && t("sidebar.profile")}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
