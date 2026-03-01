import { JobApplication, JobStatus } from "@/types";
import { formatDistance } from "date-fns";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MoreVertical,
  Trash2,
  ExternalLink,
  Banknote,
  CalendarDays,
  XCircle,
  Ban,
  Rocket,
  Pencil,
  Mail,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteJob as supabaseDeleteJob, updateJob as supabaseUpdateJob } from "@/lib/supabase/jobs";
import { TooltipProvider } from "@/components/ui/tooltip";

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void; // <--- Props baru buat oper data ke parent
  isFreeUser?: boolean;
  isAdmin?: boolean;
}

export default function JobCard({ job, onEdit }: JobCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768;
  });

  // ... (Kode StatusKeys, Labels, dan Logic Status SAMA PERSIS seperti sebelumnya) ...
  // Biar pendek, saya skip bagian yang tidak berubah. 
  // Copy logic handleDelete, handleToggleReject, handleToggleStatus, dll dari kodemu yang lama ke sini.

  const statusKeys: (keyof JobStatus)[] = ["applied", "emailed", "cvResponded", "interviewEmail", "contractEmail"];
  const isRejected = job.status.rejected === true;
  const lastActiveIndex = statusKeys.map(k => job.status[k]).lastIndexOf(true);
  const statusLabels: Record<string, string> = {
    applied: "Application Sent",
    emailed: "Follow-up Emailed",
    cvResponded: "CV Responded",
    interviewEmail: "Interview Invite",
    contractEmail: "Contract Offer 🚀",
  };
  // Show current stage even if rejected (for jobs that reached response/interview)
  const currentStatusText = lastActiveIndex >= 0 ? statusLabels[statusKeys[lastActiveIndex]] : "Not Started";
  // Check if job reached response or interview stage (should stay in those categories even if rejected)
  const hasReachedResponseOrInterview = job.status.cvResponded || job.status.interviewEmail;
  const completedCount = statusKeys.filter((k) => job.status[k]).length;
  const formattedSalary = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(job.potentialSalary || 0);

  const handleDelete = async () => {
    if (!confirm("Delete this application permanently?")) return;
    await supabaseDeleteJob(job.id!);
  };

  const handleEditClick = () => {
    onEdit(job);
  };


  const handleToggleReject = async () => {
    const newStatus = { ...job.status, rejected: !isRejected };
    await supabaseUpdateJob(job.id!, { status: newStatus });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleToggleStatus = async (clickedKey: keyof JobStatus) => {
    // Allow status changes even if rejected (user can update progress)
    const clickedIndex = statusKeys.indexOf(clickedKey);
    const isCurrentlyOn = job.status[clickedKey];
    const newStatus = { ...job.status };
    if (!isCurrentlyOn) {
      for (let i = 0; i <= clickedIndex; i++) newStatus[statusKeys[i]] = true;
    } else {
      for (let i = clickedIndex; i < statusKeys.length; i++) newStatus[statusKeys[i]] = false;
    }
    await supabaseUpdateJob(job.id!, { status: newStatus });
  };

  const handlePreviousStage = async () => {
    if (lastActiveIndex > 0) {
      const newStatus = { ...job.status };
      const newStage = lastActiveIndex - 1;
      for (let i = newStage; i < statusKeys.length; i++) newStatus[statusKeys[i]] = false;
      await supabaseUpdateJob(job.id!, { status: newStatus });
    }
  };

  const handleNextStage = async () => {
    if (lastActiveIndex < statusKeys.length - 1) {
      const newStatus = { ...job.status };
      const newStage = lastActiveIndex + 1;
      for (let i = 0; i <= newStage; i++) newStatus[statusKeys[i]] = true;
      await supabaseUpdateJob(job.id!, { status: newStatus });
    }
  };

  return (
    <TooltipProvider>
      <div className={`group relative flex flex-col backdrop-blur-md border rounded-xl shadow-md transition-all duration-300
      ${isRejected && !hasReachedResponseOrInterview
          ? "bg-card border-red-200 hover:border-red-300"
          : isRejected && hasReachedResponseOrInterview
          ? "bg-card border-border border-l-4 border-l-red-400 hover:border-l-red-500"
          : "bg-card border-border hover:shadow-lg hover:border-primary/50"
        }
    `}>

        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none bg-gradient-to-br 
        ${isRejected && !hasReachedResponseOrInterview ? "from-red-50/50 to-transparent" : isRejected && hasReachedResponseOrInterview ? "from-red-50/30 to-transparent" : "from-primary/5 to-transparent"}`}
        />

        {/* Header */}
        <div className="p-5 flex justify-between items-start relative z-10">
          <div className="flex-1 md:cursor-default cursor-pointer" onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              toggleExpand();
            }
          }}>
            <div className="flex items-start gap-2">
              <h3 className={`font-bold text-base line-clamp-2 tracking-wide transition-colors ${isRejected && !hasReachedResponseOrInterview ? "text-muted-foreground line-through decoration-red-400/50" : "text-foreground group-hover:text-primary"}`}>
                {job.jobTitle}
              </h3>
            </div>
            <div className="flex items-center text-muted-foreground text-xs uppercase tracking-widest mt-1 gap-2 font-medium">
              <Building2 className="w-3.5 h-3.5" />
              <span>{job.industry}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleExpand}
              className="md:hidden h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border text-foreground shadow-lg">

              {/* --- MENU EDIT --- */}
              <DropdownMenuItem
                onClick={handleEditClick}
                className={`cursor-pointer hover:bg-accent`}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Application
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleToggleReject} className="cursor-pointer hover:bg-accent">
                {isRejected ? (
                  <>
                    <Rocket className="w-4 h-4 mr-2 text-blue-500" />
                    Mark as Active
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4 mr-2 text-red-500" />
                    Mark as Rejected
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem
                onClick={handleDelete}
                className={`text-red-500 focus:text-red-400 focus:bg-red-50 cursor-pointer`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Application
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Body Information */}
            <div className="px-5 pb-4 space-y-4 flex-1 relative z-10">
          {job.potentialSalary ? (
            <div className={`inline-flex items-center text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full shadow-sm
            ${isRejected && !hasReachedResponseOrInterview
                ? "text-slate-500 bg-slate-50 border border-slate-200 grayscale"
                : isRejected && hasReachedResponseOrInterview
                ? "text-blue-600 bg-blue-50 border border-blue-200 opacity-75"
                : "text-blue-700 bg-blue-50 border border-blue-200"
              }`}>
              <Banknote className="w-3.5 h-3.5 mr-2" />
              {formattedSalary}
            </div>
          ) : (
            <div className="h-8"></div>
          )}

          {/* --- TAMPILKAN EMAIL JIKA ADA --- */}
          {job.recruiterEmail && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>{job.recruiterEmail}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mt-4 border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {job.createdAt ? formatDistance(job.createdAt, new Date(), { addSuffix: true }) : "Just now"}
            </div>
            {job.applicationUrl && (
              <a href={job.applicationUrl} target="_blank" rel="noreferrer" className="flex items-center hover:text-primary transition-colors duration-300">
                View Job <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
        </div>

        {/* Footer / Status Bar */}
        <div className={`relative z-10 border-t p-4 rounded-b-xl backdrop-blur-sm transition-colors duration-300
         ${isRejected && !hasReachedResponseOrInterview ? "bg-red-50 border-red-200" : isRejected && hasReachedResponseOrInterview ? "bg-muted/30 border-border border-t-red-200" : "bg-muted/30 border-border"}
      `}>
          <div className="flex justify-between items-end mb-3">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                Current Stage
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {isRejected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 border border-red-300 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                    <XCircle className="w-3 h-3" />
                    Rejected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 h-2 w-full">
            {statusKeys.map((key) => (
              <div
                key={key}
                title={statusLabels[key]}
                className={`flex-1 rounded-sm transition-all duration-300
                ${isRejected && !hasReachedResponseOrInterview
                    ? "bg-red-200"
                    : job.status[key]
                      ? isRejected && hasReachedResponseOrInterview
                        ? "bg-blue-600 shadow-sm scale-y-110 opacity-75"
                        : "bg-blue-600 shadow-sm scale-y-110"
                      : "bg-muted"
                  }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={handlePreviousStage}
              disabled={lastActiveIndex <= 0 || (isRejected && !hasReachedResponseOrInterview)}
              className={`p-2.5 rounded-xl border transition-all duration-200 shadow-sm
                ${lastActiveIndex <= 0 || (isRejected && !hasReachedResponseOrInterview)
                  ? "border-border text-muted-foreground cursor-not-allowed opacity-30"
                  : "border-border text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-md hover:shadow-blue-500/10 active:scale-95"
                }`}
              title="Previous Stage"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className={`text-sm font-semibold tracking-wide px-4 py-2 rounded-xl min-w-[120px] text-center border border-border shadow-sm
              ${completedCount === 5 ? "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" : "text-foreground"}
            `}>
              {currentStatusText}
            </div>

            <button
              onClick={handleNextStage}
              disabled={lastActiveIndex >= statusKeys.length - 1 || (isRejected && !hasReachedResponseOrInterview)}
              className={`p-2.5 rounded-xl border transition-all duration-200 shadow-sm
                ${lastActiveIndex >= statusKeys.length - 1 || (isRejected && !hasReachedResponseOrInterview)
                  ? "border-border text-muted-foreground cursor-not-allowed opacity-30"
                  : "border-border text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-md hover:shadow-blue-500/10 active:scale-95"
                }`}
              title="Next Stage"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}