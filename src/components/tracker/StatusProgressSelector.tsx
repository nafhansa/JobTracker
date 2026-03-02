import { JobStatus } from "@/types";
import { ChevronDown, Rocket } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface StatusProgressSelectorProps {
  status: JobStatus;
  onStatusChange: (newStatus: JobStatus) => void;
  isRejected?: boolean;
}

const statusKeys: (keyof JobStatus)[] = ["applied", "emailed", "cvResponded", "interviewEmail", "contractEmail"];
const statusLabels: Record<string, string> = {
  applied: "Application Sent",
  emailed: "Follow-up Emailed",
  cvResponded: "CV Responded",
  interviewEmail: "Interview Invite",
  contractEmail: "Contract Offer 🚀",
};

export default function StatusProgressSelector({ status, onStatusChange, isRejected = false }: StatusProgressSelectorProps) {
  const lastActiveIndex = statusKeys.map(k => status[k]).lastIndexOf(true);
  const currentStatusText = lastActiveIndex >= 0 ? statusLabels[statusKeys[lastActiveIndex]] : "Not Started";
  const hasReachedResponseOrInterview = status.cvResponded || status.interviewEmail;
  const completedCount = statusKeys.filter((k) => status[k]).length;
  const isDisabled = isRejected && !hasReachedResponseOrInterview;

  const handleStatusSelect = (selectedIndex: number) => {
    const newStatus = { ...status };
    for (let i = 0; i <= selectedIndex; i++) newStatus[statusKeys[i]] = true;
    for (let i = selectedIndex + 1; i < statusKeys.length; i++) newStatus[statusKeys[i]] = false;
    onStatusChange(newStatus);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isDisabled}
          className={`flex items-center gap-2 min-w-[200px] justify-between px-4 h-10 rounded-lg border-border shadow-sm transition-all duration-200
            ${completedCount === 5 ? "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" : "text-foreground"}
            ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 hover:bg-primary/5"}
          `}
        >
          <span className="text-sm font-medium truncate">{currentStatusText}</span>
          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[220px] bg-card border-border shadow-lg">
        {statusKeys.map((key, index) => {
          const isActive = index <= lastActiveIndex;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleStatusSelect(index)}
              className={`cursor-pointer transition-colors
                ${isActive ? "text-foreground hover:bg-accent" : "text-muted-foreground hover:bg-accent"}
              `}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`w-2 h-2 rounded-full flex-shrink-0
                  ${isActive ? "bg-blue-500" : "bg-muted"}
                `} />
                <span className="text-sm">{statusLabels[key]}</span>
                {key === "contractEmail" && index === lastActiveIndex && (
                  <Rocket className="w-3 h-3 ml-auto text-blue-500" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
