"use client";

import { BarChart3, Briefcase, User, Plus, Settings as SettingsIcon, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language/context";
import { SidebarSection } from "@/components/Sidebar";
import DashboardClient from "./tracker/DashboardClient";

interface MobileBottomNavProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  onPlusButtonClick: () => void;
  isPlusLoading?: boolean;
}

export default function MobileBottomNav({ 
  activeSection, 
  onSectionChange, 
  onPlusButtonClick,
  isPlusLoading = false
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
                    data-tutorial="add-button-mobile"
                    onClick={onPlusButtonClick}
                    disabled={isPlusLoading}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background dark:ring-card active:scale-90 transition-all duration-200 disabled:opacity-80"
                  >
                    {isPlusLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
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
                isActive ? "text-primary" : "text-muted-foreground"
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
