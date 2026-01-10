"use client";

import { useState } from "react";
import { JobApplication, JobStatus, FREE_PLAN_JOB_LIMIT } from "@/types";
import JobCard from "@/components/tracker/JobCard";
import JobFormModal from "@/components/forms/AddJobModal"; // Import versi baru tadi
import { Search, Sparkles, Briefcase, Send, MessageSquare, UserCheck, ScrollText, XCircle, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPlanLimits, isAdminUser } from "@/lib/firebase/subscription";
import { useAuth } from "@/lib/firebase/auth-context";

interface DashboardClientProps {
  initialJobs: JobApplication[];
  userId: string;
  subscription?: any;
  plan?: string;
}

export default function DashboardClient({ initialJobs, userId, subscription, plan }: DashboardClientProps) {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const jobs = initialJobs;
  
  const isAdmin = isAdminUser(user?.email || "");
  
  // Get plan limits
  const planLimit = getPlanLimits(plan, isAdmin);
  const isFreeUser = plan === "free" && !isAdmin;
  const usageText = isFreeUser ? `${jobs.length}/${planLimit}` : "Unlimited"; 

  // --- STATE MODAL & EDIT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);

  // Fungsi buka modal Add
  const handleAddNew = () => {
    setEditingJob(null); // Reset mode jadi Add
    setIsModalOpen(true);
  };

  // Fungsi buka modal Edit (dipanggil dari JobCard)
  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job); // Set data yg mau diedit
    setIsModalOpen(true);
  };
  // --------------------------

  const getJobStage = (status: JobStatus) => {
    if (status.rejected) return "rejected";
    if (status.contractEmail) return "offer";
    if (status.interviewEmail) return "interview";
    if (status.cvResponded) return "response";
    if (status.emailed) return "emailed";
    return "applied";
  };

  const filteredJobs = jobs.filter((job) => {
    const matchSearch = 
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.industry.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    
    if (filterStatus === "ALL") return true;
    
    if (filterStatus === "ON_GOING") {
        return !job.status.contractEmail; 
    }

    const currentStage = getJobStage(job.status);
    return currentStage === filterStatus;
  });
  
  const tabs = [
    { id: "ALL", label: "All Jobs", icon: Briefcase },
    { id: "applied", label: "Applied", icon: Send },
    { id: "response", label: "Responded", icon: MessageSquare }, 
    { id: "interview", label: "Interview", icon: UserCheck },
    { id: "offer", label: "Offers", icon: ScrollText },
    { id: "rejected", label: "Rejected", icon: XCircle },
  ];

  return (
    <div className="max-w-5xl mx-auto">      
      
      {/* Usage Indicator for Free Users */}
      {isFreeUser && (
        <div className="mb-4 p-3 rounded-lg bg-[#3E0703]/40 border border-[#FFF0C4]/20 flex items-center justify-between">
          <span className="text-sm text-[#FFF0C4]/80">
            Jobs tracked: <span className="font-bold text-[#FFF0C4]">{usageText}</span>
          </span>
          {jobs.length >= planLimit && (
            <span className="text-xs text-yellow-400 font-semibold">Limit reached</span>
          )}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">        
        
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#FFF0C4]/50" />
          <Input 
            placeholder="Search role or company..." 
            className="pl-10 bg-[#3E0703]/20 border-[#FFF0C4]/20 text-[#FFF0C4] placeholder:text-[#FFF0C4]/30 focus-visible:ring-[#8C1007] rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* --- TOMBOL ADD MANUAL (Panggil handleAddNew) --- */}
        <Button 
          onClick={handleAddNew}
          className="bg-[#FFF0C4] text-[#3E0703] hover:bg-white border border-[#FFF0C4] font-bold tracking-wide shadow-[0_0_15px_rgba(255,240,196,0.3)] transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </Button>

      </div>
      
      {/* TABS (Tidak berubah) */}
      <div className="flex flex-wrap gap-2 mb-8 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = filterStatus === tab.id;
          const count = jobs.filter(j => 
            tab.id === "ALL" ? true : getJobStage(j.status) === tab.id
          ).length;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border
                ${isActive 
                  ? "bg-[#FFF0C4] text-[#3E0703] border-[#FFF0C4] shadow-[0_0_15px_rgba(255,240,196,0.2)]" 
                  : "bg-transparent text-[#FFF0C4]/60 border-[#FFF0C4]/10 hover:border-[#FFF0C4]/40 hover:text-[#FFF0C4]"}
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#3E0703]/20" : "bg-[#FFF0C4]/10"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* List Jobs */}
      {filteredJobs.length === 0 ? (
        <div className="border-2 border-dashed border-[#FFF0C4]/30 bg-[#3E0703]/20 rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-[#8C1007]/20 rounded-full text-[#FFF0C4]">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-xl font-serif font-bold text-[#FFF0C4] mb-2">
            {searchQuery ? "No matching jobs found" : "No applications in this stage"}
          </h3>
          <p className="text-[#FFF0C4]/60 max-w-sm mx-auto">
            {searchQuery ? "Try adjusting your search terms." : "Keep pushing! Your dream job is waiting."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onEdit={handleEditJob} // <--- Oper Fungsi Edit ke Card
              isFreeUser={isFreeUser}
              plan={plan}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* --- MODAL DIRENDER DI SINI (SATU UNTUK SEMUA) --- */}
      <JobFormModal 
        userId={userId} 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen}
        jobToEdit={editingJob} // Kirim data kalau lagi ngedit
        plan={plan}
        currentJobCount={jobs.length}
        isAdmin={isAdmin}
      />

    </div>
  );
}