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
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Pencil,
  User,
  Zap,
  Mail,
  Instagram,
} from "lucide-react";
import {
  GenerationType,
  ToneType,
  ColdChannel,
  CHANNEL_OPTIONS,
  TONE_OPTIONS,
  CoinsBalance,
  COINS_PER_GENERATION,
  UserProfile,
  OutputLanguage,
  LANGUAGE_OPTIONS,
} from "@/lib/ai/types";
import { JobApplication } from "@/types";
import JobPicker from "./JobPicker";
import JobFormModal from "@/components/forms/AddJobModal";

const CHANNEL_ICONS: Record<ColdChannel, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  linkedin: MessageSquare,
  instagram: Instagram,
  whatsapp: MessageSquare,
};

interface ColdOutreachFormProps {
  userId: string;
  profile: UserProfile | null;
  onGenerated: (content: string, type: GenerationType, targetCompany?: string, targetRole?: string, documentId?: string) => void;
  coins: CoinsBalance | null;
  plan: string;
  isAdmin?: boolean;
  onNavigateToApplications?: () => void;
}

export default function ColdOutreachForm({
  userId,
  profile,
  onGenerated,
  coins,
  plan,
  isAdmin = false,
}: ColdOutreachFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [channel, setChannel] = useState<ColdChannel>("email");
  const [targetName, setTargetName] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [tone, setTone] = useState<ToneType>("professional");
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
    } else {
      setSelectedJobId(job.id || "");
      setTargetCompany(job.company);
      setTargetRole(job.jobTitle);
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

      const typeMap: Record<ColdChannel, GenerationType> = {
        email: "cold_email",
        linkedin: "cold_linkedin",
        instagram: "cold_dm_instagram",
        whatsapp: "cold_wa",
      };

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: typeMap[channel],
          channel,
          jobId: selectedJobId || undefined,
          targetName: targetName || undefined,
          targetCompany: targetCompany || undefined,
          targetRole: targetRole || undefined,
          tone,
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

      onGenerated(data.content, typeMap[channel], targetCompany || undefined, targetRole || undefined, data.documentId);
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
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex w-6 h-6 rounded-full bg-primary text-primary-foreground items-center justify-center text-[11px] font-bold shrink-0">
              1
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Choose a channel
            </h3>
          </div>

          <div className="sm:ml-9">
            <div className="flex gap-2 flex-wrap">
              {CHANNEL_OPTIONS.map((opt) => {
                const Icon = CHANNEL_ICONS[opt.value];
                const isSelected = channel === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setChannel(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex w-6 h-6 rounded-full bg-primary text-primary-foreground items-center justify-center text-[11px] font-bold shrink-0">
              2
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Who are you reaching out to?
            </h3>
          </div>

          <div className="sm:ml-9">
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleSourceChange(false)}
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
                onClick={() => handleSourceChange(true)}
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
              <div className="space-y-3">
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
          </div>
        </div>

        {(useManual || !!selectedJobId) && (
          <div className="sm:ml-9">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="w-3 h-3" />
                Recipient Name <span className="text-[10px]">(optional)</span>
              </label>
              <Input
                placeholder={
                  channel === "instagram"
                    ? "e.g. @username or name"
                    : "e.g. Sarah Johnson — leave blank if unknown"
                }
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="bg-background h-10"
              />
            </div>
          </div>
        )}

        <div className="sm:ml-9 space-y-1.5">
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

        <div className="border border-border rounded-xl overflow-hidden sm:ml-9">
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
                  Additional Notes <span className="text-[10px]">(optional)</span>
                </label>
                <textarea
                  placeholder="Any context about why you're reaching out, shared connections, etc..."
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
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg text-sm sm:ml-9">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span className="text-amber-800 dark:text-amber-300 text-xs">
              Set up your <strong>Professional Profile</strong> in the Profile tab for more
              personalized outreach.
            </span>
          </div>
        )}

        <div className="sm:ml-9">
          <Button
            type="submit"
            disabled={loading || hasInsufficientCoins || !canGenerate}
            className="w-full h-12 text-sm font-semibold rounded-xl transition-all"
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
                Generate{" "}
                {CHANNEL_OPTIONS.find((c) => c.value === channel)?.label || "Message"}
                {isAdmin ? (
                  <span className="ml-1.5 opacity-70 text-xs">· admin</span>
                ) : (
                  <span className="ml-1.5 opacity-70 text-xs">· 80 JPs</span>
                )}
              </>
            )}
          </Button>
        </div>
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