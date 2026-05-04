"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Briefcase,
  Building,
  ChevronDown,
  ChevronUp,
  Pencil,
  User,
  Zap,
  Check,
} from "lucide-react";
import {
  GenerationType,
  ToneType,
  GenerationFormat,
  OutputLanguage,
  CoinsBalance,
  COINS_PER_GENERATION,
  UserProfile,
  TONE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/ai/types";
import { JobApplication } from "@/types";
import JobPicker from "./JobPicker";
import JobFormModal from "@/components/forms/AddJobModal";

interface CoverLetterFormProps {
  userId: string;
  profile: UserProfile | null;
  onGenerated: (content: string, type: GenerationType, targetCompany?: string, targetRole?: string, documentId?: string) => void;
  coins: CoinsBalance | null;
  plan: string;
  isAdmin?: boolean;
  onNavigateToApplications?: () => void;
}

export default function CoverLetterForm({
  userId,
  profile,
  onGenerated,
  coins,
  plan,
  isAdmin = false,
}: CoverLetterFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [targetName, setTargetName] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [tone, setTone] = useState<ToneType>("professional");
  const [format, setFormat] = useState<GenerationFormat>("full_letter");
  const [language, setLanguage] = useState<OutputLanguage>("en");
  const [customContext, setCustomContext] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
    }
  };

  const handleSourceChange = (manual: boolean) => {
    setUseManual(manual);
    setSelectedJobId("");
    setTargetCompany("");
    setTargetRole("");
    setTargetName("");
  };

  const handleJobSelect = (job: JobApplication) => {
    if (selectedJobId === job.id) {
      setSelectedJobId("");
      setTargetCompany("");
      setTargetRole("");
      setTargetName("");
    } else {
      setSelectedJobId(job.id || "");
      setTargetCompany(job.company);
      setTargetRole(job.jobTitle);
      setTargetName("");
    }
  };

  const handleJobAdded = () => {
    setIsAddJobOpen(false);
    fetchJobs();
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const hasInsufficientCoins = !isAdmin && (!coins || coins.total_coins < COINS_PER_GENERATION);
  const canGenerate = useManual
    ? !!(targetCompany.trim() && targetRole.trim())
    : !!selectedJobId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasInsufficientCoins) return;

    setLoading(true);
    try {
      const token = await user?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "cover_letter",
          jobId: selectedJobId || undefined,
          targetName: targetName || undefined,
          targetCompany: targetCompany || undefined,
          targetRole: targetRole || undefined,
          tone,
          format,
          language,
          customContext: customContext || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          toast.error("Insufficient JPs", { description: data.error || "You need more Job Points to generate." });
        } else {
          toast.error("Generation failed", { description: data.error || "Something went wrong. Please try again." });
        }
        return;
      }

      onGenerated(data.content, "cover_letter", targetCompany || undefined, targetRole || undefined, data.documentId);
      setCustomContext("");
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Generation failed", { description: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
              1
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Where is this cover letter going?
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 ml-9">
            <button
              type="button"
              onClick={() => handleSourceChange(false)}
              className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all text-center ${
                !useManual
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              {!useManual && (
                <div className="absolute top-2 right-2">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <Briefcase
                className={`w-5 h-5 ${!useManual ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-sm font-medium ${!useManual ? "text-primary" : "text-foreground"}`}
              >
                From Tracker
              </span>
              <span className="text-[11px] text-muted-foreground">
                {jobs.length} job{jobs.length !== 1 ? "s" : ""} tracked
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSourceChange(true)}
              className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all text-center ${
                useManual
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              {useManual && (
                <div className="absolute top-2 right-2">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <Pencil
                className={`w-5 h-5 ${useManual ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-sm font-medium ${useManual ? "text-primary" : "text-foreground"}`}
              >
                Enter Details
              </span>
              <span className="text-[11px] text-muted-foreground">
                Type company & role
              </span>
            </button>
          </div>
        </div>

        {!useManual ? (
          <div className="space-y-3 ml-9">
            <JobPicker
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={handleJobSelect}
              onAddJob={() => setIsAddJobOpen(true)}
            />
            {selectedJob && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Company <span className="text-primary text-[10px]">(from job)</span>
                  </label>
                  <Input
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="bg-background h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Role / Position <span className="text-primary text-[10px]">(from job)</span>
                  </label>
                  <Input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-background h-10"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 ml-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Company <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Google"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
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
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-background h-10"
                />
              </div>
            </div>
          </div>
        )}

        {(useManual || !!selectedJobId) && (
          <div className="ml-9">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="w-3 h-3" />
                Recipient Name <span className="text-[10px]">(optional)</span>
              </label>
              <Input
                placeholder="e.g. Sarah Johnson — leave blank if unknown"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="bg-background h-10"
              />
            </div>
          </div>
        )}

        <div className="ml-9 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Language</label>
          <div className="flex gap-2">
            {LANGUAGE_OPTIONS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLanguage(l.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  language === l.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden ml-9">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <span>Customize tone & details</span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showAdvanced && (
<div className="px-4 pb-4 space-y-4 border-t border-border">
              <div className="space-y-2 pt-4">
                <label className="text-xs font-medium text-muted-foreground">
                  Tone
                </label>
                <div className="flex gap-2">
                  {LANGUAGE_OPTIONS.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => setLanguage(l.value)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        language === l.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {TONE_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        tone === t.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Format
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat("full_letter")}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                      format === "full_letter"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    Full Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("body_only")}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                      format === "body_only"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    Body Only
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Additional Notes <span className="text-[10px]">(optional)</span>
                </label>
                <textarea
                  placeholder="Specific achievements, skills, or details you want highlighted..."
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>

        {!profile?.summary && !profile?.skills?.length && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg text-sm ml-9">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span className="text-amber-800 dark:text-amber-300 text-xs">
              Set up your <strong>Professional Profile</strong> in the Profile tab for more
              personalized results.
            </span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || hasInsufficientCoins || !canGenerate}
          className="w-full h-12 text-sm font-semibold rounded-xl ml-9 transition-all"
          variant={canGenerate && !hasInsufficientCoins ? "default" : "secondary"}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : hasInsufficientCoins ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              No JPs Available
            </>
          ) : !canGenerate ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Select a target to continue
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Cover Letter
              {isAdmin ? (
                <span className="ml-1.5 opacity-70 text-xs">· admin</span>
              ) : (
                <span className="ml-1.5 opacity-70 text-xs">· 80 JPs</span>
              )}
            </>
          )}
        </Button>
      </form>

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
    </>
  );
}