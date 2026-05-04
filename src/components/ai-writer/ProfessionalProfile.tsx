"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile, ExperienceEntry, EducationEntry } from "@/lib/ai/types";
import { Save, Loader2, Upload, Plus, Trash2, FileText, CheckCircle2, AlertCircle, Pencil, X, Briefcase, GraduationCap, User, Mail, Phone, Linkedin } from "lucide-react";
import { toast } from "sonner";

interface ProfessionalProfileProps {
  userId: string;
}

function hasProfileData(p: {
  fullName: string; email: string; phone: string; linkedinUrl: string;
  summary: string; skills: string[]; experience: ExperienceEntry[];
  education: EducationEntry[];
}) {
  return !!(
    p.fullName || p.email || p.phone || p.linkedinUrl ||
    p.summary || p.skills.length || p.experience.length || p.education.length
  );
}

function expHasData(e: ExperienceEntry) {
  return !!(e.company || e.role || e.duration || e.description);
}

function eduHasData(e: EducationEntry) {
  return !!(e.institution || e.degree || e.field || e.year);
}

export default function ProfessionalProfile({ userId }: ProfessionalProfileProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const res = await fetch("/api/ai/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setFullName(data.profile.full_name || "");
          setEmail(data.profile.email || "");
          setPhone(data.profile.phone || "");
          setLinkedinUrl(data.profile.linkedin_url || "");
          setSummary(data.profile.summary || "");
          setSkills(data.profile.skills || []);
          setExperience(data.profile.experience || []);
          setEducation(data.profile.education || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const hasData = hasProfileData({ fullName, email, phone, linkedinUrl, summary, skills, experience, education });

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const res = await fetch("/api/ai/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          phone: phone,
          linkedin_url: linkedinUrl,
          summary: summary,
          skills,
          experience,
          education,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setEditing(false);
        toast.success("Profile saved", {
          description: "Your professional profile has been updated.",
          icon: <CheckCircle2 className="w-4 h-4" />,
        });
      } else {
        toast.error("Failed to save", {
          description: "Something went wrong. Please try again.",
          icon: <AlertCircle className="w-4 h-4" />,
        });
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Failed to save", {
        description: "Something went wrong. Please try again.",
        icon: <AlertCircle className="w-4 h-4" />,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = await user?.getIdToken();
      if (!token) return;

      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/ai/profile/extract-resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        if (data.extracted) {
          const ex = data.extracted;
          if (ex.fullName) setFullName(ex.fullName);
          if (ex.email) setEmail(ex.email);
          if (ex.phone) setPhone(ex.phone);
          if (ex.linkedinUrl) setLinkedinUrl(ex.linkedinUrl);
          if (ex.summary) setSummary(ex.summary);
          if (Array.isArray(ex.skills)) setSkills(ex.skills);
          if (Array.isArray(ex.experience)) setExperience(ex.experience);
          if (Array.isArray(ex.education)) setEducation(ex.education);
          setEditing(true);
          toast.success("Resume extracted", {
            description: "Fields auto-filled. Review and save your profile.",
            icon: <CheckCircle2 className="w-4 h-4" />,
          });
        }
      } else {
        toast.error("Extraction failed", {
          description: data.error || "Failed to extract resume data.",
          icon: <AlertCircle className="w-4 h-4" />,
        });
      }
    } catch (err) {
      console.error("Resume upload failed:", err);
      toast.error("Upload failed", {
        description: "Failed to process resume. Please try again.",
        icon: <AlertCircle className="w-4 h-4" />,
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperience([...experience, { company: "", role: "", duration: "", description: "" }]);
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { institution: "", degree: "", field: "", year: "" }]);
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!editing && hasData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{fullName || "Professional Profile"}</p>
              <p className="text-[11px] text-muted-foreground">Used by AI Writer to personalize results</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>

        <div className="bg-card dark:bg-card border border-border rounded-xl p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Upload Resume
            </CardTitle>
          </CardHeader>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleResumeUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <span>
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploading ? "Extracting..." : "Upload Resume"}
                </span>
              </Button>
            </label>
            <span className="text-xs text-muted-foreground">PNG, JPEG, WebP (max 10MB)</span>
          </div>
        </div>

        <div className="bg-card dark:bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Personal Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {fullName && (
              <div>
                <p className="text-[11px] text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium text-foreground">{fullName}</p>
              </div>
            )}
            {email && (
              <div className="flex items-start gap-1.5">
                <div>
                  <p className="text-[11px] text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{email}</p>
                </div>
              </div>
            )}
            {phone && (
              <div>
                <p className="text-[11px] text-muted-foreground">Phone</p>
                <p className="text-sm font-medium text-foreground">{phone}</p>
              </div>
            )}
            {linkedinUrl && (
              <div>
                <p className="text-[11px] text-muted-foreground">LinkedIn</p>
                <p className="text-sm font-medium text-primary hover:underline truncate">{linkedinUrl}</p>
              </div>
            )}
          </div>
          {summary && (
            <div className="pt-1">
              <p className="text-[11px] text-muted-foreground mb-1">Summary</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
          )}
          {!fullName && !email && !phone && !linkedinUrl && !summary && (
            <p className="text-xs text-muted-foreground">No personal info added yet</p>
          )}
        </div>

        {skills.length > 0 && (
          <div className="bg-card dark:bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {experience.length > 0 && experience.some(expHasData) && (
          <div className="bg-card dark:bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3 h-3" /> Experience
            </h3>
            <div className="space-y-3">
              {experience.filter(expHasData).map((exp, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-sm font-medium text-foreground">{exp.role}{exp.role && exp.company ? " at " : ""}{exp.company}</p>
                  {exp.duration && <p className="text-xs text-muted-foreground">{exp.duration}</p>}
                  {exp.description && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && education.some(eduHasData) && (
          <div className="bg-card dark:bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3 h-3" /> Education
            </h3>
            <div className="space-y-3">
              {education.filter(eduHasData).map((edu, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-sm font-medium text-foreground">
                    {edu.degree}{edu.degree && edu.field ? " in " : ""}{edu.field}
                  </p>
                  {edu.institution && <p className="text-xs text-muted-foreground">{edu.institution}</p>}
                  {edu.year && <p className="text-xs text-muted-foreground">{edu.year}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {hasData ? "Edit Profile" : "Set Up Your Profile"}
        </h3>
        {hasData && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="gap-1.5 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
            Cancel
          </Button>
        )}
      </div>

      <div className="bg-card dark:bg-card border border-border rounded-xl p-4">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Upload Resume
            <span className="text-[11px] font-normal text-muted-foreground">(auto-fills fields below)</span>
          </CardTitle>
        </CardHeader>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleResumeUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button variant="outline" size="sm" asChild disabled={uploading}>
              <span>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? "Extracting..." : "Upload Resume"}
              </span>
            </Button>
          </label>
          <span className="text-xs text-muted-foreground">PNG, JPEG, WebP</span>
        </div>
      </div>

      <div className="bg-card dark:bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Personal Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="bg-background h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="bg-background h-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" className="bg-background h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">LinkedIn URL</Label>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/johndoe" className="bg-background h-10" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Professional Summary</Label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="Brief summary of your professional background and key strengths..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-card dark:bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills</h3>
          <div className="flex items-center gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="w-36 bg-background h-8 text-sm"
            />
            <Button size="sm" variant="outline" onClick={addSkill} className="h-8 w-8 p-0">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
              {skill}
              <button onClick={() => removeSkill(i)} className="text-primary/50 hover:text-primary transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
          {skills.length === 0 && <p className="text-xs text-muted-foreground">No skills added yet</p>}
        </div>
      </div>

      <div className="bg-card dark:bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience</h3>
          <Button size="sm" variant="outline" onClick={addExperience} className="h-7 text-xs gap-1">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {experience.map((exp, i) => (
            <div key={i} className="p-3 bg-muted/30 border border-border rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-medium">Experience {i + 1}</span>
                <button onClick={() => removeExperience(i)} className="text-destructive/60 hover:text-destructive transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} placeholder="Company" className="bg-background h-9 text-sm" />
                <Input value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} placeholder="Role" className="bg-background h-9 text-sm" />
              </div>
              <Input value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} placeholder="Duration (e.g. Jan 2022 - Present)" className="bg-background h-9 text-sm" />
              <textarea
                value={exp.description}
                onChange={(e) => updateExperience(i, "description", e.target.value)}
                placeholder="Key achievements and responsibilities..."
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          ))}
          {experience.length === 0 && <p className="text-xs text-muted-foreground">No experience added yet</p>}
        </div>
      </div>

      <div className="bg-card dark:bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Education</h3>
          <Button size="sm" variant="outline" onClick={addEducation} className="h-7 text-xs gap-1">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="p-3 bg-muted/30 border border-border rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-medium">Education {i + 1}</span>
                <button onClick={() => removeEducation(i)} className="text-destructive/60 hover:text-destructive transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <Input value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} placeholder="Institution" className="bg-background h-9 text-sm" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder="Degree" className="bg-background h-9 text-sm" />
                <Input value={edu.field} onChange={(e) => updateEducation(i, "field", e.target.value)} placeholder="Field" className="bg-background h-9 text-sm" />
                <Input value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} placeholder="Year" className="bg-background h-9 text-sm" />
              </div>
            </div>
          ))}
          {education.length === 0 && <p className="text-xs text-muted-foreground">No education added yet</p>}
        </div>
      </div>

      <div className="flex gap-3">
        {hasData && (
          <Button
            variant="outline"
            onClick={() => setEditing(false)}
            className="flex-1 h-11 text-sm font-semibold rounded-xl"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 h-11 text-sm font-semibold rounded-xl"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Profile
        </Button>
      </div>
    </div>
  );
}