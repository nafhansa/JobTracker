"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Briefcase, Pencil, ArrowRight, Globe, CheckCircle2 } from "lucide-react";
import { JobApplication } from "@/types";
import { ApplicationStage, STAGE_LABELS, CompanyInfo } from "@/lib/ai/types";
import { toast } from "sonner";
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
  companyUrl: string;
  companyInfo: CompanyInfo | null;
  onTargetCompanyChange: (v: string) => void;
  onTargetRoleChange: (v: string) => void;
  onTargetNameChange: (v: string) => void;
  onTargetStageChange: (v: ApplicationStage | null) => void;
  onJobIdChange: (v: string) => void;
  onUseManualChange: (v: boolean) => void;
  onCompanyUrlChange: (v: string) => void;
  onCompanyInfoChange: (v: CompanyInfo | null) => void;
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
  companyUrl = "",
  companyInfo = null,
  onTargetCompanyChange,
  onTargetRoleChange,
  onTargetNameChange,
  onTargetStageChange,
  onJobIdChange,
  onUseManualChange,
  onCompanyUrlChange,
  onCompanyInfoChange,
  onNext,
  onBack,
  plan,
  isAdmin,
}: TargetSelectorProps) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);

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
      onTargetRoleChange(job.jobTitle || '');
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

  const handleContinue = async () => {
    if (!canContinue) return;

    if (companyUrl.trim()) {
      setScrapeLoading(true);
      try {
        const token = await user?.getIdToken();
        if (!token) { setScrapeLoading(false); return; }
        const res = await fetch("/api/ai/company-info", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ url: companyUrl }),
        });
        const data = await res.json();
        if (res.ok && data.companyInfo) {
          onCompanyInfoChange(data.companyInfo);
          toast.success("Company info loaded", { description: "Details will enhance your generation" });
        } else {
          onCompanyInfoChange(null);
        }
      } catch {
        onCompanyInfoChange(null);
      } finally {
        setScrapeLoading(false);
      }
    }

    onNext();
  };

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

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">Company Website</span>
            <span className="text-[10px] text-muted-foreground">(optional — enriches your generation with real company info)</span>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <Input
            placeholder="e.g. google.com or https://google.com"
            value={companyUrl}
            onChange={(e) => {
              onCompanyUrlChange(e.target.value);
              if (companyInfo) onCompanyInfoChange(null);
            }}
            className="bg-background h-9 text-sm"
            disabled={scrapeLoading}
          />
          {scrapeLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Fetching company info...
            </div>
          )}
          {companyInfo && !scrapeLoading && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-medium text-foreground">Company info ready</span>
              </div>
              {companyInfo.description && (
                <p className="text-xs text-muted-foreground">{companyInfo.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {companyInfo.industry && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {companyInfo.industry}
                  </span>
                )}
                {companyInfo.companySize && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    {companyInfo.companySize}
                  </span>
                )}
                {companyInfo.headquarters && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    {companyInfo.headquarters}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
        <Button
          onClick={handleContinue}
          disabled={!canContinue || scrapeLoading}
          className="gap-1.5"
        >
          {scrapeLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching info...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
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