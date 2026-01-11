// /home/nafhan/Documents/projek/job/src/components/forms/AddJobModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addJob, updateJob } from "@/lib/firebase/firestore"; // Pastikan import updateJob
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Briefcase, Building, Wallet, Link as LinkIcon, Mail, Loader2, Pencil, Lock, AlertCircle, Clock } from "lucide-react";
import { JobApplication, JobStatus, FREE_PLAN_JOB_LIMIT } from "@/types";
import { checkCanAddJob, canEditDelete } from "@/lib/firebase/subscription";

interface JobModalProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobToEdit?: JobApplication | null; // Data job kalau mau edit
  plan?: string;
  currentJobCount?: number;
  isAdmin?: boolean;
}

export default function JobFormModal({ userId, isOpen, onOpenChange, jobToEdit, plan, currentJobCount = 0, isAdmin = false }: JobModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const isFreeUser = plan === "free" && !isAdmin;
  const isEditMode = !!jobToEdit;
  const canEdit = canEditDelete(plan, isAdmin);
  const canAdd = checkCanAddJob(plan, currentJobCount, isAdmin);
  
  // Block edit mode for free users
  useEffect(() => {
    if (isOpen && isEditMode && !canEdit) {
      const upgrade = confirm(
        "Upgrade to Pro to edit your job applications.\n\nWould you like to upgrade now?"
      );
      if (upgrade) {
        router.push("/pricing");
      }
      onOpenChange(false);
    }
  }, [isOpen, isEditMode, canEdit, router, onOpenChange]);
  
  // State Form
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "", // Dianggap sebagai Company Name berdasarkan konteks sebelumnya
    potentialSalary: "",
    applicationUrl: "",
    jobType: "",
    recruiterEmail: "",
    status: {
      applied: true,
      emailed: false,
      cvResponded: false,
      interviewEmail: false,
      contractEmail: false,
    } as JobStatus
  });

  // Efek: Kalau jobToEdit berubah (misal tombol edit diklik), isi form
  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        jobTitle: jobToEdit.jobTitle,
        industry: jobToEdit.industry,
        potentialSalary: jobToEdit.potentialSalary?.toString() || "",
        applicationUrl: jobToEdit.applicationUrl || "",
        jobType: jobToEdit.jobType || "",
        recruiterEmail: jobToEdit.recruiterEmail || "",
        status: jobToEdit.status,
      });
    } else {
      // Reset kalau mode Add
      setFormData({
        jobTitle: "",
        industry: "",
        potentialSalary: "",
        applicationUrl: "",
        jobType: "",
        recruiterEmail: "",
        status: { applied: true, emailed: false, cvResponded: false, interviewEmail: false, contractEmail: false }
      });
    }
  }, [jobToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Block edit for free users
    if (isEditMode && !canEdit) {
      router.push("/upgrade");
      return;
    }
    
    // Block add if limit reached
    if (!isEditMode && !canAdd) {
      router.push("/upgrade");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        userId,
        jobTitle: formData.jobTitle,
        industry: formData.industry,
        potentialSalary: Number(formData.potentialSalary) || 0,
        applicationUrl: formData.applicationUrl,
        jobType: formData.jobType || undefined,
        recruiterEmail: formData.recruiterEmail,
        currency: "IDR",
        status: formData.status,
      };

      if (jobToEdit && jobToEdit.id) {
        // --- MODE EDIT ---
        await updateJob(jobToEdit.id, payload);
      } else {
        // --- MODE ADD ---
        await addJob(payload);
      }
      
      onOpenChange(false); // Tutup Modal
    } catch (error) {
      console.error(error);
      alert("Error saving job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card text-foreground border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md">
              {isEditMode ? <Pencil className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
            </span>
            {isEditMode ? "Edit Application" : "Track New Job"}
          </DialogTitle>
        </DialogHeader>

        {/* Warning for edit mode (free users) */}
        {isEditMode && !canEdit && (
          <div className="p-3 bg-yellow-100 border border-yellow-400 rounded-lg flex items-start gap-2 text-yellow-800">
            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Edit locked for Free Plan</p>
              <p className="text-xs">Upgrade to Pro to edit your job applications.</p>
            </div>
          </div>
        )}

        {/* Warning for add mode (limit reached) */}
        {!isEditMode && !canAdd && (
          <div className="p-3 bg-yellow-100 border border-yellow-400 rounded-lg flex items-start gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Job limit reached</p>
              <p className="text-xs">You&apos;ve reached the limit of {FREE_PLAN_JOB_LIMIT} jobs. Upgrade to Pro for unlimited jobs.</p>
            </div>
          </div>
        )}

        {/* Usage indicator for free users */}
        {isFreeUser && !isEditMode && (
          <div className="p-2 bg-muted/50 border border-border rounded text-xs text-muted-foreground">
            Using {currentJobCount}/{FREE_PLAN_JOB_LIMIT} jobs
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5 py-4">
          
          {/* Job Title */}
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-foreground font-semibold tracking-wide text-xs uppercase">Job Title *</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
              <Input
                id="title"
                required
                placeholder="e.g. Frontend Developer"
                className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-white transition-all"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>
          </div>

          {/* Company */}
          <div className="grid gap-2">
            <Label htmlFor="industry" className="text-foreground font-semibold tracking-wide text-xs uppercase">Company / Industry *</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
              <Input
                id="industry"
                required
                placeholder="e.g. Google / Tech"
                className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-white transition-all"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Salary */}
            <div className="grid gap-2">
              <Label htmlFor="salary" className="text-foreground font-semibold tracking-wide text-xs uppercase">Salary (IDR)</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
                <Input
                  id="salary"
                  type="number"
                  placeholder="0"
                  className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-white transition-all"
                  value={formData.potentialSalary}
                  onChange={(e) => setFormData({ ...formData, potentialSalary: e.target.value })}
                />
              </div>
            </div>
            
            {/* Email (OPSIONAL - required dihapus) */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-foreground font-semibold tracking-wide text-xs uppercase">Recruiter Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hr@mail.com (Optional)" 
                  className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-white transition-all"
                  value={formData.recruiterEmail}
                  onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Job Source */}
          <div className="grid gap-2">
            <Label htmlFor="jobSource" className="text-foreground font-semibold tracking-wide text-xs uppercase">Job Source</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-primary/50 pointer-events-none z-10" />
              <select
                id="jobSource"
                className="pl-9 w-full h-9 rounded-md border border-border bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50 focus-visible:border-primary transition-all appearance-none cursor-pointer"
                value={formData.applicationUrl}
                onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
              >
                <option value="">Select job source...</option>
                <option value="Linkedin">Linkedin</option>
                <option value="Company Website">Company Website</option>
                <option value="JobStreets">JobStreets</option>
                <option value="Indeed">Indeed</option>
                <option value="Kalibrr">Kalibrr</option>
                <option value="Upwork">Upwork</option>
              </select>
              <svg
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Job Type */}
          <div className="grid gap-2">
            <Label htmlFor="jobType" className="text-foreground font-semibold tracking-wide text-xs uppercase">Jenis Kerjaan</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-primary/50 pointer-events-none z-10" />
              <select
                id="jobType"
                className="pl-9 w-full h-9 rounded-md border border-border bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50 focus-visible:border-primary transition-all appearance-none cursor-pointer"
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              >
                <option value="">Select jenis kerjaan...</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Full Time">Full Time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <svg
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || (isEditMode && !canEdit) || (!isEditMode && !canAdd)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 mt-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (isEditMode && !canEdit) ? (
              "Edit Locked - Upgrade Required"
            ) : (!isEditMode && !canAdd) ? (
              "Limit Reached - Upgrade Required"
            ) : isEditMode ? (
              "Update Application"
            ) : (
              "Start Tracking"
            )}
          </Button>
          
          {((isEditMode && !canEdit) || (!isEditMode && !canAdd)) && (
            <Button
              type="button"
              onClick={() => router.push("/upgrade")}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 mt-2"
            >
              Upgrade to Pro Now
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}