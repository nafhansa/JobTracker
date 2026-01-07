// /home/nafhan/Documents/projek/job/src/components/forms/AddJobModal.tsx
"use client";

import { useEffect, useState } from "react";
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
import { Plus, Briefcase, Building, Wallet, Link as LinkIcon, Mail, Loader2, Pencil } from "lucide-react";
import { JobApplication, JobStatus } from "@/types";

interface JobModalProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobToEdit?: JobApplication | null; // Data job kalau mau edit
}

export default function JobFormModal({ userId, isOpen, onOpenChange, jobToEdit }: JobModalProps) {
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "", // Dianggap sebagai Company Name berdasarkan konteks sebelumnya
    potentialSalary: "",
    applicationUrl: "",
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
        recruiterEmail: "",
        status: { applied: true, emailed: false, cvResponded: false, interviewEmail: false, contractEmail: false }
      });
    }
  }, [jobToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        userId,
        jobTitle: formData.jobTitle,
        industry: formData.industry,
        potentialSalary: Number(formData.potentialSalary) || 0,
        applicationUrl: formData.applicationUrl,
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

  const isEditMode = !!jobToEdit;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#FFF0C4] text-[#3E0703] border-[#8C1007]/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold text-[#3E0703] flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#8C1007] flex items-center justify-center text-white shadow-md">
              {isEditMode ? <Pencil className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
            </span>
            {isEditMode ? "Edit Application" : "Track New Job"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5 py-4">
          
          {/* Job Title */}
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-[#3E0703]/80 font-bold tracking-wide text-xs uppercase">Job Title *</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-[#8C1007]/50" />
              <Input
                id="title"
                required
                placeholder="e.g. Frontend Developer"
                className="pl-9 bg-white/60 border-[#3E0703]/10 text-[#3E0703] placeholder:text-[#3E0703]/30 focus-visible:ring-[#8C1007] focus-visible:bg-white transition-all"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>
          </div>

          {/* Company */}
          <div className="grid gap-2">
            <Label htmlFor="industry" className="text-[#3E0703]/80 font-bold tracking-wide text-xs uppercase">Company / Industry *</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-[#8C1007]/50" />
              <Input
                id="industry"
                required
                placeholder="e.g. Google / Tech"
                className="pl-9 bg-white/60 border-[#3E0703]/10 text-[#3E0703] placeholder:text-[#3E0703]/30 focus-visible:ring-[#8C1007] focus-visible:bg-white transition-all"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Salary */}
            <div className="grid gap-2">
              <Label htmlFor="salary" className="text-[#3E0703]/80 font-bold tracking-wide text-xs uppercase">Salary (IDR)</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-3 h-4 w-4 text-[#8C1007]/50" />
                <Input
                  id="salary"
                  type="number"
                  placeholder="0"
                  className="pl-9 bg-white/60 border-[#3E0703]/10 text-[#3E0703] placeholder:text-[#3E0703]/30 focus-visible:ring-[#8C1007] focus-visible:bg-white transition-all"
                  value={formData.potentialSalary}
                  onChange={(e) => setFormData({ ...formData, potentialSalary: e.target.value })}
                />
              </div>
            </div>
            
            {/* Email (OPSIONAL - required dihapus) */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[#3E0703]/80 font-bold tracking-wide text-xs uppercase">Recruiter Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#8C1007]/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hr@mail.com (Optional)" 
                  className="pl-9 bg-white/60 border-[#3E0703]/10 text-[#3E0703] placeholder:text-[#3E0703]/30 focus-visible:ring-[#8C1007] focus-visible:bg-white transition-all"
                  value={formData.recruiterEmail}
                  onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* URL */}
          <div className="grid gap-2">
            <Label htmlFor="url" className="text-[#3E0703]/80 font-bold tracking-wide text-xs uppercase">Job Link</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-[#8C1007]/50" />
              <Input
                id="url"
                placeholder="https://..."
                className="pl-9 bg-white/60 border-[#3E0703]/10 text-[#3E0703] placeholder:text-[#3E0703]/30 focus-visible:ring-[#8C1007] focus-visible:bg-white transition-all"
                value={formData.applicationUrl}
                onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#8C1007] hover:bg-[#a31208] text-white font-bold py-6 mt-2 shadow-[0_4px_14px_0_rgba(140,16,7,0.39)] transition-all"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? "Update Application" : "Start Tracking")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}