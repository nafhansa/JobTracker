"use client";

import { useState, useMemo, useEffect } from "react";
import { FreelanceJob } from "@/types";
import FreelanceStats from "./FreelanceStats";
import FreelanceJobCard from "./FreelanceJobCard";
import AddFreelanceModal from "./AddFreelanceModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { TrackerMode } from "@/components/TrackerModeSwitcher";
import { useLanguage } from "@/lib/language/context";
import { subscribeToFreelanceJobs, deleteFreelanceJob } from "@/lib/supabase/freelance-jobs";

interface FreelanceDashboardProps {
  userId: string;
  trackerMode?: TrackerMode;
  initialOpenModal?: boolean;
  onModalClose?: () => void;
}

export default function FreelanceDashboard({ userId, trackerMode, initialOpenModal, onModalClose }: FreelanceDashboardProps) {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<FreelanceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const isClientMode = trackerMode === "client";
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<FreelanceJob | null>(null);

  useEffect(() => {
    if (initialOpenModal) {
      setEditingJob(null);
      setIsModalOpen(true);
    }
  }, [initialOpenModal]);

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open && onModalClose) {
      onModalClose();
    }
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      const channel = subscribeToFreelanceJobs(userId, (data) => {
        setJobs(data);
        setLoading(false);
      });
      return () => {
        channel.unsubscribe();
      };
    }
  }, [userId]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.product.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  const handleEdit = (job: FreelanceJob) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDelete = async (job: FreelanceJob) => {
    try {
      await deleteFreelanceJob(job.id!);
      // Force an immediate UI update before realtime kicks in
      setJobs(prevJobs => prevJobs.filter(j => j.id !== job.id));
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-6">
      {!isClientMode && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Freelance Dashboard
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Track your freelance projects and income
            </p>
          </div>
          <Button
            onClick={() => { setEditingJob(null); setIsModalOpen(true); }}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2.5 shadow-md transition-all text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>
      )}

      {isClientMode && (
        <div className="flex justify-end flex-shrink-0">
          <Button
            onClick={() => { setEditingJob(null); setIsModalOpen(true); }}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2.5 shadow-md transition-all text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("client.addProject")}
          </Button>
        </div>
      )}

      {!isClientMode && <FreelanceStats jobs={jobs} />}

      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col min-h-0 flex-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isClientMode ? t("client.searchPlaceholder") : "Search by client, service, or product..."}
              className="pl-10 h-10 text-sm bg-background border-border text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {["all", "ongoing", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize
                  ${statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                {isClientMode ? t(`client.${status}`) : status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{isClientMode ? t("client.noProjects") : "No projects found"}</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <FreelanceJobCard
                key={job.id}
                job={job}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      <AddFreelanceModal
        userId={userId}
        isOpen={isModalOpen}
        onOpenChange={handleOpenChange}
        jobToEdit={editingJob}
      />
    </div>
  );
}