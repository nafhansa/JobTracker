"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { CreditsBalance, UserProfile, GenerationType } from "@/lib/ai/types";
import { checkIsPro, isAdminUser } from "@/lib/supabase/subscriptions";
import CoverLetterForm from "./CoverLetterForm";
import ColdOutreachForm from "./ColdOutreachForm";
import GenerationOutput from "./GenerationOutput";
import GenerationHistory from "./GenerationHistory";
import CreditsDisplay from "./CreditsDisplay";
import { Sparkles, FileText, MessageSquare, Clock } from "lucide-react";

type Tab = "cover-letter" | "cold-outreach" | "history";

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "cover-letter", label: "Cover Letter", icon: FileText },
  { id: "cold-outreach", label: "Cold Outreach", icon: MessageSquare },
  { id: "history", label: "History", icon: Clock },
];

export default function AIWriterSection({ userId, onNavigateToApplications }: { userId: string; onNavigateToApplications?: () => void }) {
  const { user, subscription } = useAuth();
  const isAdmin = isAdminUser(user?.email || "");
  const isSubscribed = isAdmin || checkIsPro(subscription);
  const plan = !isSubscribed ? "free" : (subscription?.plan || "free");

  const [activeTab, setActiveTab] = useState<Tab>("cover-letter");
  const [credits, setCredits] = useState<CreditsBalance | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedType, setGeneratedType] = useState<GenerationType | null>(null);
  const [generatedTargetCompany, setGeneratedTargetCompany] = useState<string | undefined>(undefined);
  const [generatedTargetRole, setGeneratedTargetRole] = useState<string | undefined>(undefined);
  const [loadingCredits, setLoadingCredits] = useState(true);

  const fetchCredits = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const res = await fetch("/api/ai/credits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    } finally {
      setLoadingCredits(false);
    }
  }, [user]);

  const fetchProfile = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const res = await fetch("/api/ai/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
    fetchProfile();
  }, [fetchCredits, fetchProfile]);

  const handleGenerated = (content: string, type: GenerationType, targetCompany?: string, targetRole?: string) => {
    setGeneratedContent(content);
    setGeneratedType(type);
    setGeneratedTargetCompany(targetCompany);
    setGeneratedTargetRole(targetRole);
    fetchCredits();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            AI Writer
          </h2>
          <p className="text-muted-foreground text-sm mt-1.5 ml-[2.625rem]">
            Generate cover letters and outreach messages
          </p>
        </div>
        <CreditsDisplay credits={credits} loading={loadingCredits} plan={plan} onPurchaseComplete={fetchCredits} />
      </div>

      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {generatedContent && generatedType && (
<GenerationOutput
            content={generatedContent}
            type={generatedType}
            targetCompany={generatedTargetCompany}
            targetRole={generatedTargetRole}
            onDismiss={() => {
              setGeneratedContent(null);
              setGeneratedType(null);
              setGeneratedTargetCompany(undefined);
              setGeneratedTargetRole(undefined);
            }}
          />
      )}

      {activeTab === "cover-letter" && (
        <CoverLetterForm
          userId={userId}
          profile={profile}
          onGenerated={handleGenerated}
          credits={credits}
          plan={plan}
          isAdmin={isAdmin}
          onNavigateToApplications={onNavigateToApplications}
        />
      )}
      {activeTab === "cold-outreach" && (
        <ColdOutreachForm
          userId={userId}
          profile={profile}
          onGenerated={handleGenerated}
          credits={credits}
          plan={plan}
          isAdmin={isAdmin}
          onNavigateToApplications={onNavigateToApplications}
        />
      )}
      {activeTab === "history" && (
        <GenerationHistory userId={userId} onSelect={(doc) => {
          setGeneratedContent(doc.content);
          setGeneratedType(doc.type as GenerationType);
          setGeneratedTargetCompany(doc.target_company || undefined);
          setGeneratedTargetRole(doc.target_role || undefined);
        }} />
      )}
    </div>
  );
}