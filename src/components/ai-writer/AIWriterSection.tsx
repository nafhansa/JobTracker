"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { toast } from "sonner";
import {
  CoinsBalance,
  UserProfile,
  GenerationType,
  ColdChannel,
  ToneType,
  GenerationFormat,
  OutputLanguage,
  GeneratedDocument,
  ApplicationStage,
  COINS_PER_GENERATION,
  CompanyInfo,
} from "@/lib/ai/types";
import { checkIsPro, isAdminUser } from "@/lib/supabase/subscriptions";
import StepIndicator from "./StepIndicator";
import AIWriterHome from "./AIWriterHome";
import CreationDetail from "./CreationDetail";
import TypeSelector from "./TypeSelector";
import LanguageSelector from "./LanguageSelector";
import ChannelSelector from "./ChannelSelector";
import TargetSelector from "./TargetSelector";
import CustomizeStep from "./CustomizeStep";
import GeneratingView from "./GeneratingView";
import GenerationOutput from "./GenerationOutput";
import { ArrowLeft } from "lucide-react";

type AIWriterView =
  | "home"
  | "detail"
  | "select-type"
  | "language"
  | "channel"
  | "target"
  | "customize"
  | "generating"
  | "result";

interface CreationFormData {
  type: GenerationType | null;
  channel: ColdChannel;
  language: OutputLanguage;
  targetName: string;
  targetCompany: string;
  targetRole: string;
  targetStage: ApplicationStage | null;
  jobId: string;
  useManual: boolean;
  tone: ToneType;
  format: GenerationFormat;
  customContext: string;
  companyUrl: string;
  companyInfo: CompanyInfo | null;
}

const INITIAL_FORM_DATA: CreationFormData = {
  type: null,
  channel: "email",
  language: "en",
  targetName: "",
  targetCompany: "",
  targetRole: "",
  targetStage: null,
  jobId: "",
  useManual: false,
  tone: "professional",
  format: "full_letter",
  customContext: "",
  companyUrl: "",
  companyInfo: null,
};

function getSteps(type: GenerationType | null, view: AIWriterView): { label: string }[] {
  if (type === "cover_letter") {
    return [
      { label: "Type" },
      { label: "Language" },
      { label: "Target" },
      { label: "Customize" },
      { label: "Generate" },
      { label: "Result" },
    ];
  }
  return [
    { label: "Type" },
    { label: "Channel" },
    { label: "Language" },
    { label: "Target" },
    { label: "Customize" },
    { label: "Generate" },
    { label: "Result" },
  ];
}

function getStepIndex(type: GenerationType | null, view: AIWriterView): number {
  if (view === "home" || view === "detail") return -1;
  if (view === "select-type") return 0;

  if (type === "cover_letter") {
    switch (view) {
      case "language": return 1;
      case "target": return 2;
      case "customize": return 3;
      case "generating": return 4;
      case "result": return 5;
      default: return 0;
    }
  }

  switch (view) {
    case "channel": return 1;
    case "language": return 2;
    case "target": return 3;
    case "customize": return 4;
    case "generating": return 5;
    case "result": return 6;
    default: return 0;
  }
}

export default function AIWriterSection({ userId, onNavigateToApplications }: { userId: string; onNavigateToApplications?: () => void }) {
  const { user, subscription } = useAuth();
  const isAdmin = isAdminUser(user?.email || "");
  const isSubscribed = isAdmin || checkIsPro(subscription);
  const plan = !isSubscribed ? "free" : (subscription?.plan || "free");

  const [view, setView] = useState<AIWriterView>("home");
  const [formData, setFormData] = useState<CreationFormData>({ ...INITIAL_FORM_DATA });
  const [coins, setCoins] = useState<CoinsBalance | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [selectedDoc, setSelectedDoc] = useState<GeneratedDocument | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedType, setGeneratedType] = useState<GenerationType | null>(null);
  const [generatedTargetCompany, setGeneratedTargetCompany] = useState<string | undefined>(undefined);
  const [generatedTargetRole, setGeneratedTargetRole] = useState<string | undefined>(undefined);
  const [generatedDocId, setGeneratedDocId] = useState<string | undefined>(undefined);

  const fetchCoins = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const res = await fetch("/api/ai/credits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins);
      }
    } catch (err) {
      console.error("Failed to fetch coins:", err);
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
    fetchCoins();
    fetchProfile();
  }, [fetchCoins, fetchProfile]);

  const resetFormAndGoHome = useCallback(() => {
    setView("home");
    setFormData({ ...INITIAL_FORM_DATA });
    setGeneratedContent(null);
    setGeneratedType(null);
    setGeneratedTargetCompany(undefined);
    setGeneratedTargetRole(undefined);
    setGeneratedDocId(undefined);
    setSelectedDoc(null);
  }, []);

  const navigate = (nextView: AIWriterView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerate = useCallback(async () => {
    if (!formData.type || !user) return;

    const hasInsufficientCoins = !isAdmin && (!coins || coins.total_coins < COINS_PER_GENERATION);
    if (hasInsufficientCoins) {
      toast.error("Insufficient JPs", { description: "You need more Job Points to generate." });
      return;
    }

    navigate("generating");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formData.type,
          channel: formData.channel || undefined,
          jobId: formData.jobId || undefined,
          targetName: formData.targetName || undefined,
          targetCompany: formData.targetCompany || undefined,
          targetRole: formData.targetRole || undefined,
          targetStage: formData.targetStage || undefined,
          tone: formData.tone,
          format: formData.type === "cover_letter" ? formData.format : undefined,
          language: formData.language,
          customContext: formData.customContext || undefined,
          companyInfo: formData.companyInfo || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          toast.error("Insufficient JPs", { description: data.error || "You need more Job Points." });
        } else {
          toast.error("Generation failed", { description: data.error || "Something went wrong." });
        }
        navigate("customize");
        return;
      }

      setGeneratedContent(data.content);
      setGeneratedType(formData.type);
      setGeneratedTargetCompany(formData.targetCompany || undefined);
      setGeneratedTargetRole(formData.targetRole || undefined);
      setGeneratedDocId(data.documentId);
      fetchCoins();
      navigate("result");
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Generation failed", { description: "Something went wrong. Please try again." });
      navigate("customize");
    }
  }, [formData, user, isAdmin, coins, fetchCoins]);

  const steps = getSteps(formData.type, view);
  const currentStep = getStepIndex(formData.type, view);

  const showStepIndicator = !["home", "detail"].includes(view) && currentStep >= 0;

  return (
    <div className="space-y-6">
      {showStepIndicator && (
        <StepIndicator steps={steps} currentStep={currentStep} />
      )}

      {view === "home" && (
        <AIWriterHome
          onCreateNew={() => navigate("select-type")}
          onSelectDoc={(doc) => {
            setSelectedDoc(doc);
            navigate("detail");
          }}
        />
      )}

      {view === "detail" && selectedDoc && (
        <CreationDetail
          content={selectedDoc.content}
          type={selectedDoc.type as GenerationType}
          targetCompany={selectedDoc.target_company || undefined}
          targetRole={selectedDoc.target_role || undefined}
          documentId={selectedDoc.id}
          onBack={resetFormAndGoHome}
        />
      )}

      {view === "select-type" && (
        <TypeSelector
          onSelect={(type) => {
            setFormData((prev) => ({ ...prev, type }));
            if (type === "cover_letter") {
              navigate("language");
            } else {
              navigate("channel");
            }
          }}
          onBack={resetFormAndGoHome}
        />
      )}

      {view === "channel" && (
        <ChannelSelector
          onSelect={(channel, type) => {
            setFormData((prev) => ({ ...prev, channel, type }));
            navigate("language");
          }}
          onBack={() => navigate("select-type")}
        />
      )}

      {view === "language" && (
        <LanguageSelector
          onSelect={(language) => {
            setFormData((prev) => ({ ...prev, language }));
            navigate("target");
          }}
          onBack={() => {
            if (formData.type === "cover_letter") {
              navigate("select-type");
            } else {
              navigate("channel");
            }
          }}
        />
      )}

      {view === "target" && (
        <TargetSelector
          userId={userId}
          targetCompany={formData.targetCompany}
          targetRole={formData.targetRole}
          targetName={formData.targetName}
          targetStage={formData.targetStage}
          jobId={formData.jobId}
          useManual={formData.useManual}
          companyUrl={formData.companyUrl}
          companyInfo={formData.companyInfo}
          onTargetCompanyChange={(v) => setFormData((prev) => ({ ...prev, targetCompany: v }))}
          onTargetRoleChange={(v) => setFormData((prev) => ({ ...prev, targetRole: v }))}
          onTargetNameChange={(v) => setFormData((prev) => ({ ...prev, targetName: v }))}
          onTargetStageChange={(v) => setFormData((prev) => ({ ...prev, targetStage: v }))}
          onJobIdChange={(v) => setFormData((prev) => ({ ...prev, jobId: v }))}
          onUseManualChange={(v) => setFormData((prev) => ({ ...prev, useManual: v }))}
          onCompanyUrlChange={(v) => setFormData((prev) => ({ ...prev, companyUrl: v }))}
          onCompanyInfoChange={(v) => setFormData((prev) => ({ ...prev, companyInfo: v }))}
          onNext={() => navigate("customize")}
          onBack={() => navigate("language")}
          plan={plan}
          isAdmin={isAdmin}
        />
      )}

      {view === "customize" && formData.type && (
        <CustomizeStep
          type={formData.type}
          channel={formData.channel}
          language={formData.language}
          tone={formData.tone}
          format={formData.format}
          customContext={formData.customContext}
          profile={profile}
          coins={coins}
          isAdmin={isAdmin}
          onLanguageChange={(l) => setFormData((prev) => ({ ...prev, language: l }))}
          onToneChange={(t) => setFormData((prev) => ({ ...prev, tone: t }))}
          onFormatChange={(f) => setFormData((prev) => ({ ...prev, format: f }))}
          onCustomContextChange={(c) => setFormData((prev) => ({ ...prev, customContext: c }))}
          onGenerate={handleGenerate}
          onBack={() => navigate("target")}
        />
      )}

      {view === "generating" && formData.type && (
        <GeneratingView type={formData.type} />
      )}

      {view === "result" && generatedContent && generatedType && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={resetFormAndGoHome}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
          <GenerationOutput
            content={generatedContent}
            type={generatedType}
            targetCompany={generatedTargetCompany}
            targetRole={generatedTargetRole}
            documentId={generatedDocId}
            onDismiss={resetFormAndGoHome}
          />
          <div className="flex justify-center">
            <button
              onClick={() => {
                setFormData({ ...INITIAL_FORM_DATA });
                navigate("select-type");
              }}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}