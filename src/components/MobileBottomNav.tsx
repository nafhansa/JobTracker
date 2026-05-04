"use client";

import { useState, useRef, useEffect } from "react";
import { BarChart3, Briefcase, User, Plus, Settings as SettingsIcon, Loader2, Users, Sparkles, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/lib/language/context";
import { SidebarSection } from "@/components/Sidebar";
import { TrackerMode } from "@/components/TrackerModeSwitcher";

interface MobileBottomNavProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  onPlusButtonClick: () => void;
  isPlusLoading?: boolean;
  trackerMode: TrackerMode;
}

export default function MobileBottomNav({
  activeSection,
  onSectionChange,
  onPlusButtonClick,
  isPlusLoading = false,
  trackerMode
}: MobileBottomNavProps) {
  const { t } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  const jobNavItems = [
    { id: "dashboard", icon: BarChart3, label: t("sidebar.dashboard") },
    { id: "applications", icon: Briefcase, label: t("sidebar.applications") },
    { id: "plus", isPlus: true },
    { id: "ai-writer", icon: Sparkles, label: "AI Writer" },
    { id: "more", icon: MoreHorizontal, label: t("sidebar.more") || "More" },
  ];

  const clientNavItems = [
    { id: "dashboard", icon: BarChart3, label: t("sidebar.dashboard") },
    { id: "clients", icon: Users, label: t("sidebar.clients") },
    { id: "plus", isPlus: true },
    { id: "ai-writer", icon: Sparkles, label: "AI Writer" },
    { id: "more", icon: MoreHorizontal, label: t("sidebar.more") || "More" },
  ];

  const navItems = trackerMode === "job" ? jobNavItems : clientNavItems;

  const isMoreActive = activeSection === "profile" || activeSection === "settings";

  const moreMenuItems = [
    { id: "profile" as SidebarSection, icon: User, label: t("sidebar.profile") || "Profile" },
    { id: "settings" as SidebarSection, icon: SettingsIcon, label: t("sidebar.settings") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-background/80 dark:bg-card/80 backdrop-blur-xl border-t border-border px-2">
      <div className="max-w-md mx-auto flex items-center justify-between h-16 pb-safe relative">
        {navItems.map((item) => {
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

          const Icon = item.icon as React.ComponentType<{ className?: string }>;

          if (item.id === "more") {
            return (
              <div key="more" className="flex-1 relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((prev) => !prev)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 group w-full ${
                    isMoreActive || moreOpen ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isMoreActive || moreOpen ? "scale-110" : ""}`} />
                  <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                </button>

                {moreOpen && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 rounded-xl border border-border bg-popover shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {moreMenuItems.map((menuItem) => {
                      const MenuItemIcon = menuItem.icon;
                      const isActive = activeSection === menuItem.id;
                      return (
                        <button
                          key={menuItem.id}
                          onClick={() => {
                            onSectionChange(menuItem.id);
                            setMoreOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <MenuItemIcon className="w-4 h-4" />
                          {menuItem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

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