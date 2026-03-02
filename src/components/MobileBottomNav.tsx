"use client";

import { BarChart3, Briefcase, User, Plus, Settings as SettingsIcon } from "lucide-react";
import { useLanguage } from "@/lib/language/context";
import { SidebarSection } from "@/components/Sidebar";

interface MobileBottomNavProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  onPlusButtonClick: () => void;
}

export default function MobileBottomNav({ activeSection, onSectionChange, onPlusButtonClick }: MobileBottomNavProps) {
  const { t } = useLanguage();

  const navItems: Array<{
    id: SidebarSection;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "dashboard", icon: BarChart3 },
    { id: "applications", icon: Briefcase },
    { id: "profile", icon: User },
    { id: "settings", icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 dark:bg-card/95 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.slice(0, 2).map((item) => {
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
              </span>
            </button>
          );
        })}

        <button
          onClick={onPlusButtonClick}
          className="group flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white ring-4 ring-blue-50 dark:ring-blue-900/20 hover:ring-blue-100 transition-all"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {navItems.slice(2).map((item) => {
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
                {item.id === "profile" && t("sidebar.profile")}
                {item.id === "settings" && t("sidebar.settings")}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
