"use client";

import { BarChart3, Briefcase, User, Plus, Settings as SettingsIcon } from "lucide-react";
import { useLanguage } from "@/lib/language/context";
import { SidebarSection } from "@/components/Sidebar";

interface MobileBottomNavProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  onPlusButtonClick: () => void;
}

export default function MobileBottomNav({ 
  activeSection, 
  onSectionChange, 
  onPlusButtonClick 
}: MobileBottomNavProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: "dashboard", icon: BarChart3, label: t("sidebar.dashboard") },
    { id: "applications", icon: Briefcase, label: t("sidebar.applications") },
    { id: "plus", isPlus: true }, 
    { id: "profile", icon: User, label: t("sidebar.profile") },
    { id: "settings", icon: SettingsIcon, label: t("sidebar.settings") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-background/80 dark:bg-card/80 backdrop-blur-xl border-t border-border px-2">
      {/* Container utama dengan lebar penuh */}
      <div className="max-w-md mx-auto flex items-center justify-between h-16 pb-safe">
        {navItems.map((item) => {
          // TOMBOL PLUS TENGAH
          if (item.isPlus) {
            return (
              <div key="center-action" className="flex-1 flex justify-center -translate-y-4">
                <button
                  onClick={onPlusButtonClick}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-[0_0_0_1px_rgb(37_99_235_/_0.1),0_1px_3px_0_rgb(37_99_235_/_0.3),0_8px_20px_-4px_rgb(37_99_235_/_0.5)] ring-4 ring-background dark:ring-card active:scale-90 transition-all duration-200"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            );
          }

          // TOMBOL NAVIGASI
          const Icon = item.icon as React.ComponentType<{ className?: string }>;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id as SidebarSection)}
              className="flex-1 flex flex-col items-center justify-center gap-1 group"
            >
              <div className={`flex flex-col items-center transition-colors duration-200 ${
                isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                <span className="text-[10px] font-medium mt-0.5">
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}