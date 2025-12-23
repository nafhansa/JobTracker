"use client";

import { useState } from "react";
import { addJob } from "@/lib/firebase/firestore";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Briefcase, Building, Wallet, Link as LinkIcon, Mail, Loader2 } from "lucide-react";
import { JobStatus } from "@/types";

export default function AddJobModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addJob({
        userId,
        jobTitle: formData.jobTitle,
        industry: formData.industry,
        potentialSalary: Number(formData.potentialSalary) || 0,
        applicationUrl: formData.applicationUrl,
        recruiterEmail: formData.recruiterEmail,
        currency: "IDR",
        status: formData.status,
      });
      
      setOpen(false); 
      
      setFormData({
        jobTitle: "",
        industry: "",
        potentialSalary: "",
        applicationUrl: "",
        recruiterEmail: "",
        status: { applied: true, emailed: false, cvResponded: false, interviewEmail: false, contractEmail: false }
      });
    } catch (error) {
      console.error(error);
      alert("Error saving job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {}
      <DialogTrigger asChild>
        <Button className="bg-[#FFF0C4] text-[#3E0703] hover:bg-white border border-[#FFF0C4] font-bold tracking-wide shadow-[0_0_15px_rgba(255,240,196,0.3)] transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </Button>
      </DialogTrigger>
      
      {}
      {}
      <DialogContent className="sm:max-w-[500px] bg-[#FFF0C4] text-[#3E0703] border-[#8C1007]/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold text-[#3E0703] flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#8C1007] flex items-center justify-center text-white shadow-md">
              <Plus className="w-5 h-5" />
            </span>
            Track New Job
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5 py-4">
          
          {}
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

          {}
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

          {}
          <div className="grid grid-cols-2 gap-4">
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
            
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[#3E0703]/80 font-bold tracking-wide text-xs uppercase">Recruiter Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#8C1007]/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hr@mail.com"
                  className="pl-9 bg-white/60 border-[#3E0703]/10 text-[#3E0703] placeholder:text-[#3E0703]/30 focus-visible:ring-[#8C1007] focus-visible:bg-white transition-all"
                  value={formData.recruiterEmail}
                  onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                />
              </div>
            </div>
          </div>

          {}
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

          {}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#8C1007] hover:bg-[#a31208] text-white font-bold py-6 mt-2 shadow-[0_4px_14px_0_rgba(140,16,7,0.39)] transition-all"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Tracking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}