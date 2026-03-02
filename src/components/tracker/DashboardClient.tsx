"use client";

import React, { useState, useMemo } from "react";
import { JobApplication, JobStatus } from "@/types";
import JobCard from "@/components/tracker/JobCard";
import JobFormModal from "@/components/forms/AddJobModal";
import JobStats from "@/components/tracker/JobStats";
import { Search, Sparkles, Briefcase, Send, MessageSquare, UserCheck, ScrollText, XCircle, Plus, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPlanLimits, isAdminUser } from "@/lib/supabase/subscriptions";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";

interface DashboardClientProps {
  initialJobs: JobApplication[];
  userId: string;
  plan?: string;
}

export default function DashboardClient({ initialJobs, userId, plan }: DashboardClientProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const jobs = initialJobs;
  
  const isAdmin = isAdminUser(user?.email || "");
  
  // Get plan limits
  const planLimit = getPlanLimits(plan, isAdmin);
  const isFreeUser = plan === "free" && !isAdmin;
  const usageText = isFreeUser ? `${jobs.length}/${planLimit}` : t("common.unlimited"); 

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
    // Prioritize actual stage over rejected status
    // If job reached interview or response stage, keep it in that category even if rejected
    if (status.contractEmail) return "offer";
    if (status.interviewEmail) return "interview";
    if (status.cvResponded) return "response";
    if (status.emailed) return "emailed";
    // Only return "rejected" if job hasn't reached response or interview stage
    if (status.rejected) return "rejected";
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

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage, itemsPerPage]);

  // Reset to page 1 when filters or search change
  useMemo(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  const tabs = [
    { id: "ALL", label: t("filter.all"), icon: Briefcase },
    { id: "applied", label: t("filter.applied"), icon: Send },
    { id: "response", label: t("filter.response"), icon: MessageSquare }, 
    { id: "interview", label: t("filter.interview"), icon: UserCheck },
    { id: "offer", label: t("filter.offer"), icon: ScrollText },
    { id: "rejected", label: t("filter.rejected"), icon: XCircle },
  ];

   return (
     <div className="max-w-[90rem] mx-auto h-full flex flex-col min-h-0 px-4 sm:px-6">

       {/* --- FIXED TOP SECTION (Header, Search, Add, Filters) --- */}
       <div className="flex-shrink-0 space-y-2 pb-2 border-b border-border">

          {/* Search & Add Button */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Stats Toggle */}
              <Button
                onClick={() => setShowStats(!showStats)}
                variant="outline"
                className="bg-card border-border text-foreground hover:bg-accent"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {t("stats.button")}
                {showStats ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>

              {/* --- TOMBOL ADD MANUAL (Panggil handleAddNew) --- */}
              <Button
                onClick={handleAddNew}
                className="bg-primary text-white hover:bg-primary/90 font-semibold tracking-wide shadow-lg shadow-blue-500/30 transition-all animate-ring-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("add.button")}
              </Button>
            </div>
          </div>

          {/* Filter Tabs - Mobile (Dropdown + All Jobs) */}
          <div className="md:hidden flex flex-wrap gap-2 pb-2">
            {/* All Jobs Button */}
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border
                ${filterStatus === "ALL"
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"}
              `}
            >
              <Briefcase className="w-4 h-4" />
              {t("filter.all")}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${filterStatus === "ALL" ? "bg-white/20" : "bg-muted"}`}>
                {jobs.length}
              </span>
            </button>

            {/* Dropdown for other filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border
                  ${filterStatus !== "ALL"
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"}
                `}>
                  {filterStatus !== "ALL" ? (
                    <>
                      {tabs.find(t => t.id === filterStatus)?.icon && (
                        <span className="w-4 h-4">
                          {React.createElement(tabs.find(t => t.id === filterStatus)!.icon)}
                        </span>
                      )}
                      {tabs.find(t => t.id === filterStatus)?.label}
                    </>
                  ) : (
                    <>
                  <Send className="w-4 h-4" />
                  {t("filter.applied")}
                </>
                  )}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {tabs.filter(tab => tab.id !== "ALL").map((tab) => {
                  const isActive = filterStatus === tab.id;
                  const count = jobs.filter(j => getJobStage(j.status) === tab.id).length;
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => setFilterStatus(tab.id)}
                      className={isActive ? "bg-accent" : ""}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="flex-1">{tab.label}</span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filter Tabs - Desktop (All tabs visible) */}
          <div className="hidden md:flex flex-wrap gap-2 pb-2 overflow-x-auto">
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
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border
                    ${isActive
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-muted"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

           {/* Pagination */}
           {totalPages > 1 && (
             <div className="flex items-center justify-center gap-2 pt-2">
               <button
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
                 className={`w-8 h-8 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                   currentPage === 1
                     ? "text-muted-foreground cursor-not-allowed opacity-50"
                     : "bg-card text-foreground border border-border hover:border-primary/50 hover:text-primary hover:bg-accent"
                 }`}
               >
                 ←
               </button>

               <div className="flex items-center gap-1">
                 {currentPage > 1 && (
                   <>
                     <span className="text-muted-foreground px-1">...</span>
                     <button
                       onClick={() => setCurrentPage(currentPage - 1)}
                       className="w-8 h-8 rounded-lg text-sm font-medium transition-all bg-card text-foreground border border-border hover:border-primary/50 hover:text-foreground hover:bg-accent"
                     >
                       {currentPage - 1}
                     </button>
                   </>
                 )}

                 <button
                   onClick={() => setCurrentPage(currentPage)}
                   className="w-8 h-8 rounded-lg text-sm font-medium transition-all bg-primary text-white shadow-md"
                 >
                   {currentPage}
                 </button>

                 {currentPage < totalPages && (
                   <>
                     <button
                       onClick={() => setCurrentPage(currentPage + 1)}
                       className="w-8 h-8 rounded-lg text-sm font-medium transition-all bg-card text-foreground border border-border hover:border-primary/50 hover:text-foreground hover:bg-accent"
                     >
                       {currentPage + 1}
                     </button>
                     <span className="text-muted-foreground px-1">...</span>
                   </>
                 )}
               </div>

               <button
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 disabled={currentPage === totalPages}
                 className={`w-8 h-8 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                   currentPage === totalPages
                     ? "text-muted-foreground cursor-not-allowed opacity-50"
                     : "bg-card text-foreground border border-border hover:border-primary/50 hover:text-primary hover:bg-accent"
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* --- SCROLLABLE CONTENT SECTION (Stats + Cards) --- */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 pt-2 md:pt-4 pb-40 md:pb-30">

          {/* --- STATS SECTION (Conditional) --- */}
          {showStats && (
            <div className="mb-4 border-b border-border">
              <JobStats jobs={jobs} />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {/* Job Cards List */}
            {paginatedJobs.length === 0 ? (
              <div className="border-2 border-dashed border-border bg-muted/30 rounded-xl p-12 text-center md:col-span-2 xl:col-span-3">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {searchQuery ? t("empty.noMatch") : t("empty.noJobs")}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery ? t("empty.adjustSearch") : t("empty.keepPushing")}
                </p>
              </div>
            ) : (
              paginatedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEditJob}
                  isFreeUser={isFreeUser}
                  isAdmin={isAdmin}
                />
              ))
            )}

          </div>

          {/* Limit Indicator */}
          {isFreeUser && (
            <div className="mt-6 md:col-span-2 xl:col-span-3">
              <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">{t("form.freeUsage")}</span>
                  <span className="text-xs text-muted-foreground">{usageText}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((jobs.length / planLimit) * 100, 100)}%` }}
                  />
                </div>
                {jobs.length >= planLimit && (
                  <p className="text-xs text-yellow-600 font-semibold mt-2">{t("form.limitReachedShort")}</p>
                )}
              </div>
            </div>
          )}
        </div>

       {/* --- MODAL --- */}
       <JobFormModal
         userId={userId}
         isOpen={isModalOpen}
         onOpenChange={setIsModalOpen}
         jobToEdit={editingJob}
         plan={plan}
         currentJobCount={jobs.length}
         isAdmin={isAdmin}
       />

    </div>
  );
}