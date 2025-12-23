"use client";

import { useState } from "react";
import { JobApplication, JobStatus } from "@/types";
import JobCard from "@/components/tracker/JobCard";
import AddJobModal from "@/components/forms/AddJobModal";
import { Search, Sparkles, Briefcase, Send, MessageSquare, UserCheck, ScrollText } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardClientProps {
  initialJobs: JobApplication[];
  userId: string;
}

export default function DashboardClient({ initialJobs, userId }: DashboardClientProps) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const jobs = initialJobs; 

  const getJobStage = (status: JobStatus) => {
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
  ];

  return (
    <div className="max-w-5xl mx-auto">      
      {}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">        
        {}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#FFF0C4]/50" />
          <Input 
            placeholder="Search role or company..." 
            className="pl-10 bg-[#3E0703]/20 border-[#FFF0C4]/20 text-[#FFF0C4] placeholder:text-[#FFF0C4]/30 focus-visible:ring-[#8C1007] rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {}
        <AddJobModal userId={userId} />
      </div>
      {}
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
      {}
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
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}