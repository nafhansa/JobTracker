import { JobApplication, JobStatus } from "@/types";
import { formatDistance } from "date-fns";
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
  Pencil, // Import Pencil
  Mail,    // Import Mail
  Lock     // Import Lock
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteJob, updateJob } from "@/lib/firebase/firestore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void; // <--- Props baru buat oper data ke parent
  isFreeUser?: boolean;
  isAdmin?: boolean;
}

export default function JobCard({ job, onEdit, isFreeUser = false, isAdmin = false }: JobCardProps) {
  const router = useRouter();
  
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
  const currentStatusText = isRejected 
    ? "Application Rejected" 
    : (lastActiveIndex >= 0 ? statusLabels[statusKeys[lastActiveIndex]] : "Not Started");
  const completedCount = statusKeys.filter((k) => job.status[k]).length;
  const formattedSalary = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(job.potentialSalary || 0);

  const handleDelete = async () => {
    if (isFreeUser && !isAdmin) {
      router.push("/upgrade");
      return;
    }
    
    if (confirm("Delete this application permanently?")) {
      await deleteJob(job.id!);
    }
  };

  const handleEditClick = () => {
    if (isFreeUser && !isAdmin) {
      router.push("/upgrade");
      return;
    }
    onEdit(job);
  };
  
  const canEdit = !isFreeUser || isAdmin;

  const handleToggleReject = async () => {
      const newStatus = { ...job.status, rejected: !isRejected };
      await updateJob(job.id!, { status: newStatus });
  };
    
  const handleToggleStatus = async (clickedKey: keyof JobStatus) => {
      if (isRejected) return; 
      const clickedIndex = statusKeys.indexOf(clickedKey);
      const isCurrentlyOn = job.status[clickedKey];
      const newStatus = { ...job.status };
      if (!isCurrentlyOn) {
        for (let i = 0; i <= clickedIndex; i++) newStatus[statusKeys[i]] = true;
      } else {
        for (let i = clickedIndex; i < statusKeys.length; i++) newStatus[statusKeys[i]] = false;
      }
      await updateJob(job.id!, { status: newStatus });
  };

  return (
    <TooltipProvider>
    <div className={`group relative flex flex-col backdrop-blur-md border rounded-xl shadow-md transition-all duration-300
      ${isRejected 
        ? "bg-card border-red-200 hover:border-red-300" 
        : "bg-card border-border hover:shadow-lg hover:border-primary/50"
      }
    `}>
      
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none bg-gradient-to-br 
        ${isRejected ? "from-red-50/50 to-transparent" : "from-primary/5 to-transparent"}`} 
      />

      {/* Header */}
      <div className="p-5 flex justify-between items-start relative z-10">
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <h3 className={`font-bold text-base line-clamp-2 tracking-wide transition-colors ${isRejected ? "text-muted-foreground line-through decoration-red-400/50" : "text-foreground group-hover:text-primary"}`}>
              {job.jobTitle}
            </h3>
            {isFreeUser && !isAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-shrink-0 pt-0.5 cursor-help">
                    <Lock className="w-4 h-4 text-yellow-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade to Pro to edit or delete jobs</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center text-muted-foreground text-xs uppercase tracking-widest mt-1 gap-2 font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span>{job.industry}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border text-foreground shadow-lg">
            
            {/* --- MENU EDIT --- */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuItem 
                    onClick={handleEditClick} 
                    disabled={!canEdit}
                    className={`${!canEdit ? "cursor-not-allowed opacity-50" : "cursor-pointer"} hover:bg-accent`}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Application
                    {!canEdit && <Lock className="w-3 h-3 ml-auto text-yellow-500" />}
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {!canEdit && (
                <TooltipContent side="right">
                  <p>Upgrade to Pro to edit jobs</p>
                </TooltipContent>
              )}
            </Tooltip>

            <DropdownMenuItem onClick={handleToggleReject} className="cursor-pointer hover:bg-accent">
              {isRejected ? (
                <>
                  <Rocket className="w-4 h-4 mr-2 text-emerald-500" />
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
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuItem 
                    onClick={handleDelete} 
                    disabled={!canEdit}
                    className={`${!canEdit ? "cursor-not-allowed opacity-50" : "text-red-500 focus:text-red-400 focus:bg-red-50 cursor-pointer"}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Application
                    {!canEdit && <Lock className="w-3 h-3 ml-auto text-yellow-500" />}
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {!canEdit && (
                <TooltipContent side="right">
                  <p>Upgrade to Pro to delete jobs</p>
                </TooltipContent>
              )}
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body Information */}
      <div className="px-5 pb-4 space-y-4 flex-1 relative z-10">
        {job.potentialSalary ? (
          <div className={`inline-flex items-center text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full shadow-sm
            ${isRejected 
              ? "text-muted-foreground bg-red-50 border border-red-200 grayscale" 
              : "text-emerald-700 bg-emerald-50 border border-emerald-200"
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

      {/* Footer / Status Bar (SAMA PERSIS) */}
      <div className={`relative z-10 border-t p-4 rounded-b-xl backdrop-blur-sm transition-colors duration-300
         ${isRejected ? "bg-red-50 border-red-200" : "bg-muted/30 border-border"}
      `}>
         {/* ... render progress bar (sama kayak kode lamamu) ... */}
         <div className="flex justify-between items-end mb-3">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">
              {isRejected ? "Final Status" : "Current Stage"}
            </span>
            <div className="flex items-center gap-2">
              {isRejected && <XCircle className="w-4 h-4 text-red-500" />}
              <span className={`text-sm font-semibold tracking-wide ${
                isRejected 
                  ? "text-red-500" 
                  : completedCount === 5 ? "text-emerald-600" : "text-foreground"
              }`}>
                {currentStatusText}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {isRejected ? "CLOSED" : `${completedCount}/5`}
          </span>
        </div>
        
        <div className="flex gap-1.5 h-2 w-full">
          {statusKeys.map((key) => (
            <div 
              key={key}
              onClick={() => handleToggleStatus(key)}
              title={statusLabels[key]} 
              className={`flex-1 rounded-sm transition-all duration-300 
                ${isRejected 
                  ? "bg-red-200 cursor-not-allowed"
                  : job.status[key] 
                    ? "bg-emerald-500 shadow-sm scale-y-110 cursor-pointer" 
                    : "bg-muted hover:bg-primary/20 cursor-pointer"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}