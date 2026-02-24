"use client";

import { useState } from "react";
import { BarChart3, Briefcase, User, X, Menu } from "lucide-react";
import { useLanguage } from "@/lib/language/context";
import { Button } from "@/components/ui/button";

export type SidebarSection = "dashboard" | "applications" | "profile";

export interface SidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, isMobileOpen, onMobileClose }: SidebarProps) {
  const { t } = useLanguage();

  const navItems: Array<{
    id: SidebarSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "dashboard", label: t("sidebar.dashboard"), icon: BarChart3 },
    { id: "applications", label: t("sidebar.applications"), icon: Briefcase },
    { id: "profile", label: t("sidebar.profile"), icon: User },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-50 h-[calc(100vh-64px)] w-64 bg-card border-r border-border overflow-hidden
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-40
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  onMobileClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${isActive ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Decorative Bottom Section */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>{t("sidebar.connected")}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
