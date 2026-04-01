"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useOnboarding } from "@/lib/onboarding/context";
import { useLanguage } from "@/lib/language/context";
import {
  JOB_SEARCH_STAGES,
  WORK_PREFERENCES,
  EXPERIENCE_LEVELS,
  JobRole,
  TargetRole,
} from "@/lib/onboarding/types";
import { ChevronLeft, ChevronRight, Loader2, X, Search, Briefcase, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export default function QuestionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language: currentLanguage, setLanguage: setAppLanguage } = useLanguage();
  const {
    currentStep,
    formData,
    language,
    isSubmitting,
    updateFormData,
    nextStep,
    prevStep,
    submitOnboarding,
  } = useOnboarding();

  const [roleSearch, setRoleSearch] = useState("");
  const [roleResults, setRoleResults] = useState<JobRole[]>([]);
  const [searching, setSearching] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");

  useEffect(() => {
    if (language && currentLanguage !== language) {
      setAppLanguage(language);
      localStorage.setItem("language", language);
    }
  }, [language, currentLanguage, setAppLanguage]);

  const searchRoles = useCallback(async (query: string) => {
    if (query.length < 1) {
      setRoleResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/onboarding/roles?q=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      setRoleResults(data.roles || []);
    } catch (error) {
      console.error("Error searching roles:", error);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (roleSearch) {
        searchRoles(roleSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [roleSearch, searchRoles]);

  const handleAddRole = (role: JobRole) => {
    const exists = formData.targetRoles.some(
      (r) => r.type === "predefined" && r.id === role.id
    );
    if (!exists) {
      updateFormData({
        targetRoles: [
          ...formData.targetRoles,
          { type: "predefined", id: role.id, name: role.name },
        ],
      });
    }
    setRoleSearch("");
    setRoleResults([]);
  };

  const handleAddCustomRole = () => {
    const roleToAdd = customRoleInput.trim() || roleSearch.trim();
    if (roleToAdd) {
      const exists = formData.targetRoles.some(
        (r) => r.type === "custom" && r.name.toLowerCase() === roleToAdd.toLowerCase()
      );
      if (!exists) {
        updateFormData({
          targetRoles: [
            ...formData.targetRoles,
            { type: "custom", name: roleToAdd },
          ],
        });
      }
      setCustomRoleInput("");
      setRoleSearch("");
      setRoleResults([]);
    }
  };

  const handleRemoveRole = (index: number) => {
    const newRoles = formData.targetRoles.filter((_, i) => i !== index);
    updateFormData({ targetRoles: newRoles });
  };

  const toggleWorkPreference = (value: string) => {
    const current = formData.workPreferences;
    if (current.includes(value as any)) {
      updateFormData({
        workPreferences: current.filter((p) => p !== value),
      });
    } else {
      updateFormData({
        workPreferences: [...current, value as any],
      });
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.jobSearchStage !== null;
      case 2:
        return formData.targetRoles.length > 0;
      case 3:
        return formData.workPreferences.length > 0;
      case 4:
        return formData.experienceLevel !== null;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 4) {
      if (!user) return;

      const result = await submitOnboarding(user.uid);
      if (result.success) {
        toast.success(language === "id" ? "Onboarding selesai!" : "Onboarding complete!");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Failed to save");
      }
    } else {
      nextStep();
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Clock className="w-5 h-5" />;
      case 2:
        return <Briefcase className="w-5 h-5" />;
      case 3:
        return <MapPin className="w-5 h-5" />;
      case 4:
        return <Briefcase className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-2 sm:space-y-3">
            {JOB_SEARCH_STAGES.map((stage) => (
              <button
                key={stage.value}
                onClick={() => updateFormData({ jobSearchStage: stage.value })}
                className={`
                  w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left
                  flex items-center gap-2.5 sm:gap-3
                  ${formData.jobSearchStage === stage.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card"
                  }
                `}
              >
                <div
                  className={`
                    w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0
                    ${formData.jobSearchStage === stage.value
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                    }
                  `}
                >
                  {formData.jobSearchStage === stage.value && (
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-foreground text-xs sm:text-base">
                  {t(stage.labelKey)}
                </span>
              </button>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder={t("onboarding.q2.search_placeholder")}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {!searching && roleSearch.length >= 1 && roleResults.length === 0 && (
              <div className="border border-border rounded-xl bg-card p-3 sm:p-4">
                <div className="text-muted-foreground text-xs sm:text-sm mb-2">
                  {t("onboarding.q2.custom_placeholder")}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRoleInput || roleSearch}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2 rounded-lg border border-border bg-card text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddCustomRole();
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!customRoleInput) setCustomRoleInput(roleSearch);
                      handleAddCustomRole();
                    }}
                    className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium"
                  >
                    {t("common.add")}
                  </button>
                </div>
              </div>
            )}

            {roleResults.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden bg-card max-h-40 sm:max-h-48 overflow-y-auto">
                {roleResults.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleAddRole(role)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-foreground text-xs sm:text-sm">{role.name}</div>
                      <div className="text-muted-foreground text-[10px] sm:text-xs">{role.category}</div>
                    </div>
                    <span className="text-primary text-xs sm:text-sm">+</span>
                  </button>
                ))}
              </div>
            )}

            {formData.targetRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {formData.targetRoles.map((role, index) => (
                  <span
                    key={`${role.type}-${role.id || role.name}-${index}`}
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm"
                  >
                    {role.name}
                    <button
                      onClick={() => handleRemoveRole(index)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {WORK_PREFERENCES.map((pref) => (
              <button
                key={pref.value}
                onClick={() => toggleWorkPreference(pref.value)}
                className={`
                  p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left
                  flex items-center gap-2.5 sm:gap-3
                  ${formData.workPreferences.includes(pref.value)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card"
                  }
                `}
              >
                <div
                  className={`
                    w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center shrink-0
                    ${formData.workPreferences.includes(pref.value)
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                    }
                  `}
                >
                  {formData.workPreferences.includes(pref.value) && (
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-foreground text-xs sm:text-base">
                  {t(pref.labelKey)}
                </span>
              </button>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-2 sm:space-y-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => updateFormData({ experienceLevel: level.value })}
                className={`
                  w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left
                  flex items-center gap-2.5 sm:gap-3
                  ${formData.experienceLevel === level.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card"
                  }
                `}
              >
                <div
                  className={`
                    w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0
                    ${formData.experienceLevel === level.value
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                    }
                  `}
                >
                  {formData.experienceLevel === level.value && (
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-foreground text-xs sm:text-base">
                  {t(level.labelKey)}
                </span>
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const questions = [
    { key: "onboarding.q1.title", icon: Clock },
    { key: "onboarding.q2.title", icon: Briefcase },
    { key: "onboarding.q3.title", icon: MapPin },
    { key: "onboarding.q4.title", icon: Briefcase },
  ];

  const currentQuestion = questions[currentStep - 1];
  const IconComponent = currentQuestion?.icon;

  return (
    <div className="w-full max-w-lg mx-auto px-5 sm:px-0">
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {IconComponent && <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              {t("onboarding.step").replace("{{current}}", String(currentStep)).replace("{{total}}", "4")}
            </span>
          </div>
          <div className="flex gap-1 sm:gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`
                  w-6 sm:w-8 h-1 sm:h-1.5 rounded-full transition-all duration-300
                  ${step <= currentStep ? "bg-primary" : "bg-muted"}
                `}
              />
            ))}
          </div>
        </div>

        <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          {t(currentQuestion?.key || "")}
        </h2>
      </div>

      <div className="mb-5 sm:mb-6">
        {renderStepContent()}
      </div>

      <div className="flex gap-2.5 sm:gap-3">
        {currentStep > 1 && (
          <button
            onClick={prevStep}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-border bg-card text-foreground text-sm sm:text-base font-medium hover:bg-accent transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("onboarding.back")}
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!isStepValid() || isSubmitting}
          className={`
            flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-all
            ${isStepValid() && !isSubmitting
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === "id" ? "Menyimpan..." : "Saving..."}
            </>
          ) : currentStep === 4 ? (
            t("onboarding.finish")
          ) : (
            <>
              {t("onboarding.next")}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}