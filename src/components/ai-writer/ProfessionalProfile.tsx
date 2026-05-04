"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile, ExperienceEntry, EducationEntry } from "@/lib/ai/types";
import { Save, Loader2, Upload, Plus, Trash2, FileText } from "lucide-react";

interface ProfessionalProfileProps {
  userId: string;
}

export default function ProfessionalProfile({ userId }: ProfessionalProfileProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
        alert("Profile saved!");
      } else {
        alert("Failed to save profile");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to save profile");
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
          alert("Resume extracted! Please review and save your profile.");
        }
      } else {
        alert(data.error || "Failed to extract resume data");
      }
    } catch (err) {
      console.error("Resume upload failed:", err);
      alert("Failed to process resume. Please try again.");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Professional Profile</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Used by AI Writer to personalize your cover letters and outreach
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Upload Resume (Auto-fill)
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="bg-background" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">LinkedIn URL</Label>
              <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/johndoe" className="bg-background" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Professional Summary</Label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Brief summary of your professional background and key strengths..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Skills</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="w-40 bg-background"
            />
            <Button size="sm" variant="outline" onClick={addSkill}><Plus className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                {skill}
                <button onClick={() => removeSkill(i)} className="text-primary/60 hover:text-primary"><Trash2 className="w-3 h-3" /></button>
              </span>
            ))}
            {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Experience</CardTitle>
          <Button size="sm" variant="outline" onClick={addExperience}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i} className="p-3 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Experience {i + 1}</span>
                <Button size="sm" variant="ghost" onClick={() => removeExperience(i)} className="text-destructive hover:text-destructive h-6 w-6 p-0"><Trash2 className="w-3 h-3" /></Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} placeholder="Company" className="bg-background" />
                <Input value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} placeholder="Role" className="bg-background" />
              </div>
              <Input value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} placeholder="Duration (e.g. Jan 2022 - Present)" className="bg-background" />
              <textarea
                value={exp.description}
                onChange={(e) => updateExperience(i, "description", e.target.value)}
                placeholder="Key achievements and responsibilities..."
                rows={2}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
          {experience.length === 0 && <p className="text-sm text-muted-foreground">No experience added yet</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Education</CardTitle>
          <Button size="sm" variant="outline" onClick={addEducation}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {education.map((edu, i) => (
            <div key={i} className="p-3 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Education {i + 1}</span>
                <Button size="sm" variant="ghost" onClick={() => removeEducation(i)} className="text-destructive hover:text-destructive h-6 w-6 p-0"><Trash2 className="w-3 h-3" /></Button>
              </div>
              <Input value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} placeholder="Institution" className="bg-background" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder="Degree" className="bg-background" />
                <Input value={edu.field} onChange={(e) => updateEducation(i, "field", e.target.value)} placeholder="Field of study" className="bg-background" />
                <Input value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} placeholder="Year" className="bg-background" />
              </div>
            </div>
          ))}
          {education.length === 0 && <p className="text-sm text-muted-foreground">No education added yet</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Profile
        </Button>
      </div>
    </div>
  );
}