"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addJob as supabaseAddJob, updateJob as supabaseUpdateJob } from "@/lib/supabase/jobs";
import { useLanguage } from "@/lib/language/context";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Briefcase, Building, Wallet, Link as LinkIcon, Mail, Loader2, Pencil, Lock, AlertCircle, Clock, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { JobApplication, JobStatus, FREE_PLAN_JOB_LIMIT, SalaryType } from "@/types";
import { checkCanAddJob, canEditDelete } from "@/lib/supabase/subscriptions";

interface JobModalProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobToEdit?: JobApplication | null;
  plan?: string;
  currentJobCount?: number;
  isAdmin?: boolean;
}

export default function JobFormModal({ userId, isOpen, onOpenChange, jobToEdit, plan, currentJobCount = 0, isAdmin = false }: JobModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const isFreeUser = plan === "free" && !isAdmin;
  const isEditMode = !!jobToEdit;
  const canEdit = canEditDelete(plan, isAdmin);
  const canAdd = checkCanAddJob(plan, currentJobCount, isAdmin);
  
  const sanitizeNumber = (value: string) => value.replace(/[^0-9]/g, '');
  
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
  
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
    }
  }, [isOpen]);
  
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "",
    potentialSalary: "",
    potentialSalaryMin: "",
    potentialSalaryMax: "",
    salaryType: "unspecified" as SalaryType,
    applicationUrl: "",
    jobType: "",
    location: "",
    recruiterEmail: "",
    status: {
      applied: true,
      emailed: false,
      cvResponded: false,
      interviewEmail: false,
      contractEmail: false,
    } as JobStatus
  });

  useEffect(() => {
    if (jobToEdit) {
      const jobSalaryType = jobToEdit.salaryType || 
        (jobToEdit.potentialSalaryMin && jobToEdit.potentialSalaryMax ? 'range' : 
        (jobToEdit.potentialSalary || jobToEdit.potentialSalaryMin ? 'exact' : 'unspecified'));
      
      setFormData({
        jobTitle: jobToEdit.jobTitle,
        industry: jobToEdit.company || jobToEdit.industry,
        potentialSalary: jobToEdit.potentialSalary?.toString() || "",
        potentialSalaryMin: jobToEdit.potentialSalaryMin?.toString() || jobToEdit.potentialSalary?.toString() || "",
        potentialSalaryMax: jobToEdit.potentialSalaryMax?.toString() || "",
        salaryType: jobSalaryType as SalaryType,
        applicationUrl: jobToEdit.applicationUrl || "",
        jobType: jobToEdit.jobType || "",
        location: jobToEdit.location || "",
        recruiterEmail: jobToEdit.recruiterEmail || "",
        status: jobToEdit.status,
      });
    } else {
      setFormData({
        jobTitle: "",
        industry: "",
        potentialSalary: "",
        potentialSalaryMin: "",
        potentialSalaryMax: "",
        salaryType: "unspecified",
        applicationUrl: "",
        jobType: "",
        location: "",
        recruiterEmail: "",
        status: { applied: true, emailed: false, cvResponded: false, interviewEmail: false, contractEmail: false }
      });
    }
  }, [jobToEdit, isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (isEditMode && !canEdit) {
      router.push("/upgrade");
      return;
    }
    
    if (!isEditMode && !canAdd) {
      router.push("/upgrade");
      return;
    }
    
    setLoading(true);
    try {
      let salaryPayload: {
        potentialSalary?: number;
        potentialSalaryMin?: number;
        potentialSalaryMax?: number;
        salaryType: SalaryType;
      } = { salaryType: formData.salaryType };

      if (formData.salaryType === 'exact') {
        salaryPayload.potentialSalary = Number(formData.potentialSalaryMin) || 0;
        salaryPayload.potentialSalaryMin = Number(formData.potentialSalaryMin) || 0;
      } else if (formData.salaryType === 'range') {
        salaryPayload.potentialSalaryMin = Number(formData.potentialSalaryMin) || 0;
        salaryPayload.potentialSalaryMax = Number(formData.potentialSalaryMax) || 0;
      }

      const payload = {
        userId,
        jobTitle: formData.jobTitle,
        company: formData.industry,
        industry: formData.industry,
        applicationUrl: formData.applicationUrl,
        jobType: formData.jobType || undefined,
        location: formData.location || undefined,
        recruiterEmail: formData.recruiterEmail,
        currency: "IDR",
        status: formData.status,
        ...salaryPayload,
      };

      if (jobToEdit && jobToEdit.id) {
        await supabaseUpdateJob(jobToEdit.id, payload);
      } else {
        await supabaseAddJob(payload as Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Error saving job");
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = formData.jobTitle.trim() && formData.industry.trim();

  const renderStep1 = () => (
    <>
      <div className="grid gap-3 py-2">
        <div className="grid gap-1.5">
          <Label htmlFor="title" className="text-foreground font-semibold tracking-wide text-[10px] sm:text-xs uppercase">{t("form.jobTitle")} *</Label>
          <div className="relative">
            <Briefcase className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary/50" />
            <Input
              id="title"
              required
              placeholder={t("form.jobTitle.placeholder")}
              className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-white transition-all"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="industry" className="text-foreground font-semibold tracking-wide text-[10px] sm:text-xs uppercase">{t("form.company")} *</Label>
          <div className="relative">
            <Building className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary/50" />
            <Input
              id="industry"
              required
              placeholder={t("form.company.placeholder")}
              className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-white transition-all"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="email" className="text-foreground font-semibold tracking-wide text-[10px] sm:text-xs uppercase">{t("form.recruiterEmail")}</Label>
          <div className="relative">
            <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary/50" />
            <Input
              id="email"
              type="email"
              placeholder={t("form.recruiterEmail.placeholder")} 
              className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-white transition-all"
              value={formData.recruiterEmail}
              onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Button 
        type="button"
        onClick={() => setStep(2)}
        disabled={!canProceedStep1}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 sm:py-3 mt-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
      >
        {t("form.next")}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="grid gap-3 py-2">
        <div className="grid gap-1.5">
          <Label className="text-foreground font-semibold tracking-wide text-[10px] sm:text-xs uppercase">{t("form.salary")}</Label>
          
          <div className="flex flex-wrap gap-1.5 mb-1">
            {(['exact', 'range', 'unspecified'] as SalaryType[]).map((type) => (
              <label
                key={type}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium cursor-pointer transition-all border
                  ${formData.salaryType === type 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                  }`}
              >
                <input
                  type="radio"
                  name="salaryType"
                  value={type}
                  checked={formData.salaryType === type}
                  onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as SalaryType })}
                  className="sr-only"
                />
                <span className={`w-2 h-2 rounded-full border-2 transition-all
                  ${formData.salaryType === type ? 'bg-primary border-primary' : 'border-muted-foreground'}
                `} />
                {t(`form.salary.${type}`)}
              </label>
            ))}
          </div>

          {formData.salaryType === 'exact' && (
            <div className="relative">
              <Wallet className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary/50" />
              <Input
                type="text"
                inputMode="numeric"
                placeholder={t("form.salary.placeholder")}
                className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-white transition-all"
                value={formData.potentialSalaryMin}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(e.target.value);
                  setFormData({ ...formData, potentialSalaryMin: sanitized, potentialSalary: sanitized });
                }}
              />
            </div>
          )}

          {formData.salaryType === 'range' && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Wallet className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary/50" />
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder={t("form.salary.min")}
                  className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-white transition-all"
                  value={formData.potentialSalaryMin}
                  onChange={(e) => setFormData({ ...formData, potentialSalaryMin: sanitizeNumber(e.target.value) })}
                />
              </div>
              <span className="text-muted-foreground text-sm">—</span>
              <div className="relative flex-1">
                <Wallet className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary/50" />
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder={t("form.salary.max")}
                  className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-white transition-all"
                  value={formData.potentialSalaryMax}
                  onChange={(e) => setFormData({ ...formData, potentialSalaryMax: sanitizeNumber(e.target.value) })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="jobSource" className="text-foreground font-semibold tracking-wide text-[10px] sm:text-xs uppercase">{t("form.jobSource")}</Label>
          <div className="relative">
            <LinkIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary/50 pointer-events-none z-10" />
            <select
              id="jobSource"
              className="pl-8 sm:pl-9 w-full h-9 sm:h-10 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50 focus-visible:border-primary transition-all appearance-none cursor-pointer"
              value={formData.applicationUrl}
              onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
            >
              <option value="">{t("form.jobSource.placeholder")}</option>
              <option value="Linkedin">Linkedin</option>
              <option value="Company Website">Company Website</option>
              <option value="JobStreets">JobStreets</option>
              <option value="Glassdoor">Glassdoor</option>
              <option value="Braintrust">Braintrust</option>
              <option value="Glints">Glints</option>
              <option value="Indeed">Indeed</option>
              <option value="Kalibrr">Kalibrr</option>
              <option value="Upwork">Upwork</option>
            </select>
            <svg className="absolute right-3 top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5 min-w-0">
            <Label htmlFor="jobType" className="text-foreground font-semibold tracking-wide text-[10px] sm:text-xs uppercase">{t("form.jobType")}</Label>
            <div className="relative">
              <Clock className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary/50 pointer-events-none z-10" />
              <select
                id="jobType"
                className="pl-8 sm:pl-9 pr-8 w-full h-9 sm:h-10 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50 focus-visible:border-primary transition-all appearance-none cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              >
                <option value="">{t("form.jobType.placeholder")}</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              <svg className="absolute right-3 top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="location" className="text-foreground font-semibold tracking-wide text-[10px] sm:text-xs uppercase">{t("form.location")}</Label>
            <div className="relative">
              <MapPin className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary/50 pointer-events-none z-10" />
              <select
                id="location"
                className="pl-8 sm:pl-9 w-full h-9 sm:h-10 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50 focus-visible:border-primary transition-all appearance-none cursor-pointer"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                <option value="">{t("form.location.placeholder")}</option>
                <option value="Remote/WFH">Remote/WFH</option>
                <option value="On-site/WFO">On-site/WFO</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <svg className="absolute right-3 top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <Button 
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          className="flex-1 border-border text-foreground font-semibold py-2.5 sm:py-3 shadow-sm transition-all text-sm flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("form.back")}
        </Button>
        <Button 
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading}
          className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 sm:py-3 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {isEditMode ? t("form.submit.edit") : t("form.submit.add")}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-card text-foreground border-border shadow-lg">
        <DialogHeader className="space-y-2 pb-1">
          <div className="flex items-center gap-2 pr-8">
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary flex items-center justify-center text-white shadow-md">
                {isEditMode ? <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </span>
              <span>{isEditMode ? t("form.title.edit") : t("form.title.add")}</span>
            </DialogTitle>
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">
              {step}/2
            </span>
          </div>
          
          <div className="flex gap-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full rounded-full bg-primary transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`}
            />
          </div>
        </DialogHeader>

        {isEditMode && !canEdit && (
          <div className="p-2.5 sm:p-3 bg-yellow-100 border border-yellow-400 rounded-lg flex items-start gap-2 text-yellow-800">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold mb-0.5">{t("form.warning.editLocked")}</p>
              <p className="text-[10px] sm:text-xs">{t("form.warning.editUpgrade")}</p>
            </div>
          </div>
        )}

        {!isEditMode && !canAdd && (
          <div className="p-2.5 sm:p-3 bg-yellow-100 border border-yellow-400 rounded-lg flex items-start gap-2 text-yellow-800">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold mb-0.5">{t("form.warning.limitReached")}</p>
              <p className="text-[10px] sm:text-xs">{t("form.warning.limitUpgrade").replace("{limit}", FREE_PLAN_JOB_LIMIT.toString())}</p>
            </div>
          </div>
        )}

        {isFreeUser && !isEditMode && (
          <div className="p-1.5 sm:p-2 bg-muted/50 border border-border rounded text-[10px] sm:text-xs text-muted-foreground">
            {t("form.usage").replace("{current}", currentJobCount.toString()).replace("{limit}", FREE_PLAN_JOB_LIMIT.toString())}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 ? renderStep1() : renderStep2()}
        </form>

        {((isEditMode && !canEdit) || (!isEditMode && !canAdd)) && step === 2 && (
          <Button
            type="button"
            onClick={() => router.push("/upgrade")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 sm:py-2.5 shadow-lg text-sm"
          >
            {t("dashboard.upgrade")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}