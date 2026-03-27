"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  OnboardingFormData,
  OnboardingData,
  INITIAL_FORM_DATA,
  Language,
} from "./types";

interface OnboardingContextType {
  currentStep: number;
  language: Language;
  formData: OnboardingFormData;
  isSubmitting: boolean;
  completedOnboarding: OnboardingData | null;
  
  setLanguage: (lang: Language) => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  submitOnboarding: (userId: string) => Promise<{ success: boolean; error?: string }>;
  resetForm: () => void;
  setCompletedOnboarding: (data: OnboardingData | null) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguageState] = useState<Language>("id");
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOnboarding, setCompletedOnboarding] = useState<OnboardingData | null>(null);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const updateFormData = useCallback((data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, 4)));
  }, []);

  const submitOnboarding = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          language,
          jobSearchStage: formData.jobSearchStage,
          targetRoles: formData.targetRoles,
          workPreferences: formData.workPreferences,
          experienceLevel: formData.experienceLevel,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Failed to save" };
      }

      return { success: true };
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      return { success: false, error: "Network error" };
    } finally {
      setIsSubmitting(false);
    }
  }, [language, formData]);

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setFormData(INITIAL_FORM_DATA);
    setCompletedOnboarding(null);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        language,
        formData,
        isSubmitting,
        completedOnboarding,
        setLanguage,
        updateFormData,
        nextStep,
        prevStep,
        goToStep,
        submitOnboarding,
        resetForm,
        setCompletedOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}