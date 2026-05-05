"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Briefcase, Pencil, ArrowRight } from "lucide-react";
import { JobApplication } from "@/types";
import { ApplicationStage, STAGE_LABELS } from "@/lib/ai/types";
import JobPicker from "./JobPicker";
import JobFormModal from "@/components/forms/AddJobModal";

function getApplicationStage(status: JobApplication["status"]): ApplicationStage {
  if (status.contractEmail) return "offer";
  if (status.interviewEmail) return "interview";
  if (status.cvResponded) return "responded";
  if (status.emailed) return "emailed";
  if (status.rejected) return "rejected";
  return "applied";
}

interface TargetSelectorProps {
  userId: string;
  targetCompany: string;
  targetRole: string;
  targetName: string;
  targetStage: ApplicationStage | null;
  jobId: string;
  useManual: boolean;
  onTargetCompanyChange: (v: string) => void;
  onTargetRoleChange: (v: string) => void;
  onTargetNameChange: (v: string) => void;
  onTargetStageChange: (v: ApplicationStage | null) => void;
  onJobIdChange: (v: string) => void;
  onUseManualChange: (v: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  plan: string;
  isAdmin: boolean;
}

export default function TargetSelector({
  userId,
  targetCompany,
  targetRole,
  targetName,
  targetStage,
  jobId,
  useManual,
  onTargetCompanyChange,
  onTargetRoleChange,
  onTargetNameChange,
  onTargetStageChange,
  onJobIdChange,
  onUseManualChange,
  onNext,
  onBack,
  plan,
  isAdmin,
}: TargetSelectorProps) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = await user?.getIdToken();
        if (!token) return;
        const res = await fetch("/api/jobs/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [user]);

  const handleJobSelect = (job: JobApplication) => {
    if (jobId === job.id) {
      onJobIdChange("");
      onTargetCompanyChange("");
      onTargetRoleChange("");
      onTargetNameChange("");
      onTargetStageChange(null);
    } else {
      onJobIdChange(job.id || "");
      onTargetCompanyChange(job.company);
      onTargetRoleChange(job.jobTitle);
      onTargetStageChange(getApplicationStage(job.status));
    }
  };

  const handleJobAdded = () => {
    setIsAddJobOpen(false);
    const refetch = async () => {
      try {
        const token = await user?.getIdToken();
        if (!token) return;
        const res = await fetch("/api/jobs/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error("Failed to refetch jobs:", err);
      }
    };
    refetch();
  };

  const canContinue = useManual
    ? !!(targetCompany.trim() && targetRole.trim())
    : !!jobId;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Where is this going?</h2>
        <p className="text-sm text-muted-foreground">Select a job from your tracker or enter details manually</p>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={() => onUseManualChange(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            !useManual
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          From Tracker
        </button>
        <button
          type="button"
          onClick={() => onUseManualChange(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            useManual
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Pencil className="w-3.5 h-3.5" />
          Enter Details
        </button>
      </div>

      {!useManual ? (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <JobPicker
              jobs={jobs}
              selectedJobId={jobId}
              onSelectJob={handleJobSelect}
              onAddJob={() => setIsAddJobOpen(true)}
            />
          )}
          {jobId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Company <span className="text-primary text-[10px]">(from job)</span>
                </label>
                <Input
                  value={targetCompany}
                  onChange={(e) => onTargetCompanyChange(e.target.value)}
                  className="bg-background h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Role / Position <span className="text-primary text-[10px]">(from job)</span>
                </label>
                <Input
                  value={targetRole}
                  onChange={(e) => onTargetRoleChange(e.target.value)}
                  className="bg-background h-10"
                />
              </div>
            </div>
          )}
          {jobId && targetStage && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Application Stage:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                {STAGE_LABELS[targetStage]}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Company <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Google"
                value={targetCompany}
                onChange={(e) => onTargetCompanyChange(e.target.value)}
                className="bg-background h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Role / Position <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Senior Software Engineer"
                value={targetRole}
                onChange={(e) => onTargetRoleChange(e.target.value)}
                className="bg-background h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Recipient Name <span className="text-[10px]">(optional)</span>
            </label>
            <Input
              placeholder="e.g. Sarah Johnson — leave blank if unknown"
              value={targetName}
              onChange={(e) => onTargetNameChange(e.target.value)}
              className="bg-background h-10"
            />
          </div>
        </div>
      )}

      {!useManual && jobId && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Recipient Name <span className="text-[10px]">(optional)</span>
          </label>
          <Input
            placeholder="e.g. Sarah Johnson — leave blank if unknown"
            value={targetName}
            onChange={(e) => onTargetNameChange(e.target.value)}
            className="bg-background h-10"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          Continue
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <JobFormModal
        userId={userId}
        isOpen={isAddJobOpen}
        onOpenChange={(open) => {
          setIsAddJobOpen(open);
          if (!open) handleJobAdded();
        }}
        plan={plan}
        currentJobCount={jobs.length}
        isAdmin={isAdmin}
      />
    </div>
  );
}