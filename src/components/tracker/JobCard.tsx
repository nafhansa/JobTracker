import { JobApplication, JobStatus } from "@/types";
import { formatDistance } from "date-fns";
import { 
  Building2, 
  MoreVertical, 
  Trash2, 
  ExternalLink,
  Banknote,
  CalendarDays,
  XCircle, // <--- 1. Import Icon XCircle
  Ban,      // <--- Icon Ban untuk menu dropdown
  Rocket
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

interface JobCardProps {
  job: JobApplication;
}

export default function JobCard({ job }: JobCardProps) {
  
  const statusKeys: (keyof JobStatus)[] = ["applied", "emailed", "cvResponded", "interviewEmail", "contractEmail"];
  
  // 2. Cek status Rejected
  const isRejected = job.status.rejected === true;

  const lastActiveIndex = statusKeys.map(k => job.status[k]).lastIndexOf(true);
  
  const statusLabels: Record<string, string> = {
    applied: "Application Sent",
    emailed: "Follow-up Emailed",
    cvResponded: "CV Responded",
    interviewEmail: "Interview Invite",
    contractEmail: "Contract Offer 🚀",
  };

  // 3. Logic Text Status: Kalau Rejected, tulisannya beda
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
    if (confirm("Delete this application permanently?")) {
      await deleteJob(job.id!);
    }
  };

  // 4. Handle Toggle Rejected
  const handleToggleReject = async () => {
    const newStatus = { 
      ...job.status, 
      rejected: !isRejected // Toggle true/false
    };
    await updateJob(job.id!, { status: newStatus });
  };
  
  const handleToggleStatus = async (clickedKey: keyof JobStatus) => {
    // Kalau sedang rejected, jangan bisa klik bar progres biasa (opsional, biar rapi)
    if (isRejected) return; 

    const clickedIndex = statusKeys.indexOf(clickedKey);
    const isCurrentlyOn = job.status[clickedKey];
    
    const newStatus = { ...job.status };

    if (!isCurrentlyOn) {
      for (let i = 0; i <= clickedIndex; i++) {
        newStatus[statusKeys[i]] = true;
      }
    } else {
      for (let i = clickedIndex; i < statusKeys.length; i++) {
        newStatus[statusKeys[i]] = false;
      }
    }

    await updateJob(job.id!, { status: newStatus });
  };

  return (
    // 5. Ubah Border/Shadow kalau Rejected (Jadi Merah/Abu)
    <div className={`group relative flex flex-col backdrop-blur-md border rounded-xl shadow-lg transition-all duration-300
      ${isRejected 
        ? "bg-[#1a0201]/60 border-red-900/30 hover:border-red-500/30" 
        : "bg-[#3E0703]/40 border-[#FFF0C4]/10 hover:shadow-[0_0_20px_rgba(140,16,7,0.3)] hover:border-[#8C1007]/50"
      }
    `}>
      
      {/* Background Hover Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none bg-gradient-to-br 
        ${isRejected ? "from-red-900/10 to-transparent" : "from-[#8C1007]/10 to-transparent"}`} 
      />

      {/* Header Card */}
      <div className="p-5 flex justify-between items-start relative z-10">
        <div>
          <h3 className={`font-serif font-bold text-xl line-clamp-1 tracking-wide transition-colors ${isRejected ? "text-[#FFF0C4]/50 line-through decoration-red-500/50" : "text-[#FFF0C4] group-hover:text-white"}`}>
            {job.jobTitle}
          </h3>
          <div className="flex items-center text-[#FFF0C4]/60 text-xs uppercase tracking-widest mt-1 gap-2 font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span>{job.industry}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#FFF0C4]/70 hover:text-[#FFF0C4] hover:bg-[#FFF0C4]/10">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a0201] border-[#FFF0C4]/10 text-[#FFF0C4]">
            {/* 6. Menu Item untuk Reject */}
            <DropdownMenuItem onClick={handleToggleReject} className="cursor-pointer hover:bg-[#FFF0C4]/10">
              {isRejected ? (
                <>
                  <Rocket className="w-4 h-4 mr-2 text-green-400" /> {/* Import Rocket kalau belum ada */}
                  Mark as Active
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2 text-red-400" />
                  Mark as Rejected
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-[#FFF0C4]/10" />
            
            <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-400 focus:bg-[#3E0703] cursor-pointer">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Application
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body Information */}
      <div className="px-5 pb-4 space-y-4 flex-1 relative z-10">
        {job.potentialSalary ? (
          <div className={`inline-flex items-center text-xs font-bold tracking-wide px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(140,16,7,0.2)]
            ${isRejected 
              ? "text-[#FFF0C4]/40 bg-red-900/10 border border-red-900/20 grayscale" 
              : "text-[#FFF0C4] bg-[#8C1007]/20 border border-[#8C1007]/30"
            }`}>
            <Banknote className="w-3.5 h-3.5 mr-2" />
            {formattedSalary}
          </div>
        ) : (
          <div className="h-8"></div>
        )}

        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#FFF0C4]/40 mt-4 border-t border-[#FFF0C4]/5 pt-3">
          <div className="flex items-center gap-1">
             <CalendarDays className="w-3 h-3" />
             {job.createdAt ? formatDistance(job.createdAt, new Date(), { addSuffix: true }) : "Just now"}
          </div>
          {job.applicationUrl && (
            <a href={job.applicationUrl} target="_blank" rel="noreferrer" className="flex items-center hover:text-[#8C1007] transition-colors duration-300">
              View Job <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
        </div>
      </div>

      {/* Footer / Status Bar */}
      <div className={`relative z-10 border-t p-4 rounded-b-xl backdrop-blur-sm transition-colors duration-300
         ${isRejected ? "bg-red-950/20 border-red-900/20" : "bg-[#1a0201]/40 border-[#FFF0C4]/5"}
      `}>
        
        <div className="flex justify-between items-end mb-3">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-[#FFF0C4]/40 font-bold mb-0.5">
              {isRejected ? "Final Status" : "Current Stage"}
            </span>
            <div className="flex items-center gap-2">
              {isRejected && <XCircle className="w-4 h-4 text-red-500" />}
              <span className={`text-sm font-bold tracking-wide ${
                isRejected 
                  ? "text-red-400" 
                  : completedCount === 5 ? "text-[#8C1007] text-glow" : "text-[#FFF0C4]"
              }`}>
                {currentStatusText}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#FFF0C4]/50">
            {isRejected ? "CLOSED" : `${completedCount}/5`}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex gap-1.5 h-2 w-full">
          {statusKeys.map((key) => (
            <div 
              key={key}
              onClick={() => handleToggleStatus(key)}
              title={statusLabels[key]} 
              className={`flex-1 rounded-sm transition-all duration-300 
                ${isRejected 
                  ? "bg-red-900/20 cursor-not-allowed" // 7. Kalau Rejected, bar jadi gelap/mati
                  : job.status[key] 
                    ? "bg-[#8C1007] shadow-[0_0_8px_#8C1007] scale-y-110 cursor-pointer" 
                    : "bg-[#FFF0C4]/10 hover:bg-[#FFF0C4]/20 cursor-pointer"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}