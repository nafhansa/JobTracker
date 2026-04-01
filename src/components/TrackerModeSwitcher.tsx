"use client";

import { Briefcase, BriefcaseBusiness, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/language/context";

export type TrackerMode = "job" | "client";

export interface TrackerModeSwitcherProps {
  mode: TrackerMode;
  onModeChange: (mode: TrackerMode) => void;
  fullWidth?: boolean;
  jobCount?: number;
  clientCount?: number;
}

export default function TrackerModeSwitcher({
  mode,
  onModeChange,
  fullWidth = false,
  jobCount = 0,
  clientCount = 0,
}: TrackerModeSwitcherProps) {
  const { t } = useLanguage();

  const modes = [
    {
      id: "job" as TrackerMode,
      label: t("tracker.job"),
      subtitle: t("tracker.job.subtitle").replace("{count}", jobCount.toString()),
      icon: Briefcase,
      iconBgColor: "bg-blue-500",
    },
    {
      id: "client" as TrackerMode,
      label: t("tracker.client"),
      subtitle: t("tracker.client.subtitle").replace("{count}", clientCount.toString()),
      icon: BriefcaseBusiness,
      iconBgColor: "bg-purple-500",
    },
  ];

  const currentMode = modes.find((m) => m.id === mode) || modes[0];
  const CurrentIcon = currentMode.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 px-4 py-2 bg-card border border-border hover:bg-accent transition-all text-sm font-medium text-foreground shadow-sm ${fullWidth ? "w-full justify-between rounded-xl" : "rounded-full"}`}
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-4 h-4 text-primary" />
            <span>{currentMode.label}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;

          return (
            <DropdownMenuItem
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className="flex items-center gap-3 cursor-pointer py-3"
            >
              <div
                className={`w-8 h-8 rounded-full ${m.iconBgColor} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.subtitle}</p>
              </div>
              {isActive && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}