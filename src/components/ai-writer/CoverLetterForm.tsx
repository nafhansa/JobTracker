"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, User, Building, Briefcase, FileText } from "lucide-react";
import { GenerationType, ToneType, GenerationFormat, CreditsBalance, UserProfile } from "@/lib/ai/types";
import { JobApplication } from "@/types";
import { checkCanAddJob } from "@/lib/supabase/subscriptions";
import JobPicker from "./JobPicker";
import JobFormModal from "@/components/forms/AddJobModal";

interface CoverLetterFormProps {
  userId: string;
  profile: UserProfile | null;
  onGenerated: (content: string, type: GenerationType) => void;
  credits: CreditsBalance | null;
  plan: string;
  onNavigateToApplications?: () => void;
}

export default function CoverLetterForm({ userId, profile, onGenerated, credits, plan, onNavigateToApplications }: CoverLetterFormProps) {
  const { user } = useAuth();
  const isAdmin = user?.email === "nafkhan.hussein@gmail.com";
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [targetName, setTargetName] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [tone, setTone] = useState<ToneType>("professional");
  const [format, setFormat] = useState<GenerationFormat>("full_letter");
  const [customContext, setCustomContext] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
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

  const isAutoFilled = !useManual && !!selectedJobId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credits || credits.total_credits <= 0) return;

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
          customContext: customContext || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          alert(data.error || "Insufficient credits");
        } else {
          alert(data.error || "Generation failed");
        }
        return;
      }

      onGenerated(data.content, "cover_letter");
      setCustomContext("");
    } catch (err) {
      console.error("Generation failed:", err);
      alert("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasInsufficientCredits = !credits || credits.total_credits <= 0;
  const canAdd = checkCanAddJob(plan, jobs.length, isAdmin);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Cover Letter Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Source</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={useManual ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleSourceChange(false)}
                >
                  From Job Tracker
                </Button>
                <Button
                  type="button"
                  variant={useManual ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSourceChange(true)}
                >
                  Manual Input
                </Button>
              </div>
            </div>

            {!useManual && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Job</Label>
                <JobPicker
                  jobs={jobs}
                  selectedJobId={selectedJobId}
                  onSelectJob={handleJobSelect}
                  onAddJob={() => setIsAddJobOpen(true)}
                />
              </div>
            )}

            {useManual && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <User className="w-3 h-3" /> Recipient Name
                    </Label>
                    <Input
                      placeholder="e.g. Sarah Johnson"
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Building className="w-3 h-3" /> Company
                    </Label>
                    <Input
                      placeholder="e.g. Google"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Role / Position
                  </Label>
                  <Input
                    placeholder="e.g. Senior Software Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            )}

            {!useManual && isAutoFilled && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <User className="w-3 h-3" /> Recipient Name
                    </Label>
                    <Input
                      placeholder="e.g. Sarah Johnson"
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Building className="w-3 h-3" /> Company
                      <span className="text-xs text-primary ml-1">(auto-filled)</span>
                    </Label>
                    <Input
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Role / Position
                    <span className="text-xs text-primary ml-1">(auto-filled)</span>
                  </Label>
                  <Input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tone</Label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as ToneType)}
                  className="w-full h-9 rounded-md border border-border bg-transparent px-3 text-sm text-foreground"
                >
                  <option value="professional">Professional</option>
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Format</Label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as GenerationFormat)}
                  className="w-full h-9 rounded-md border border-border bg-transparent px-3 text-sm text-foreground"
                >
                  <option value="full_letter">Full Letter (with header)</option>
                  <option value="body_only">Body Text Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Additional Context (optional)</Label>
              <textarea
                placeholder="Any specific points you want to highlight, achievements, or details to include..."
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {!profile?.summary && !profile?.skills?.length && (
              <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Tip:</span> Set up your professional profile for more personalized cover letters. Go to Settings to add your details.
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || hasInsufficientCredits}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : hasInsufficientCredits ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  No Credits Available
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Cover Letter (1 Credit)
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <JobFormModal
        userId={userId}
        isOpen={isAddJobOpen}
        onOpenChange={(open) => { setIsAddJobOpen(open); if (!open) handleJobAdded(); }}
        plan={plan}
        currentJobCount={jobs.length}
        isAdmin={isAdmin}
      />
    </>
  );
}