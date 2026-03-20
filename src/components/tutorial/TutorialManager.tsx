"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { WelcomeModal } from "./WelcomeModal";
import { SpotlightTooltip, PipelineVisual } from "./SpotlightTooltip";
import { useTutorial } from "@/lib/tutorial/context";
import { useLanguage } from "@/lib/language/context";
import { MILESTONE_VALUES } from "@/lib/tutorial/types";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface TutorialManagerProps {
  jobCount: number;
  streak: number;
  onNavigateToApplications?: () => void;
}

let showCelebrationModal: (() => void) | null = null;

function CelebrationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    showCelebrationModal = () => setIsOpen(true);
    return () => {
      showCelebrationModal = null;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 10001,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"],
      });
      fire(0.2, {
        spread: 60,
        colors: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t("tutorial.complete.title")}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t("tutorial.complete.desc")}
          </p>
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t("tutorial.complete.cta")}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function triggerTutorialCompleteCelebration() {
  if (showCelebrationModal) {
    showCelebrationModal();
  }
}

export function TutorialManager({ jobCount, streak, onNavigateToApplications }: TutorialManagerProps) {
  const { isNewUser, currentStep, isTutorialActive, showMilestoneToast } = useTutorial();
  const { t } = useLanguage();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isNavigated, setIsNavigated] = useState(false);

  const milestoneValues = useMemo(() => Object.values(MILESTONE_VALUES), []);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    if (milestoneValues.includes(jobCount)) {
      const milestoneType = `apps${jobCount}` as keyof typeof MILESTONE_VALUES;
      showMilestoneToast(milestoneType as "apps15" | "apps30" | "apps50" | "apps70" | "apps100");
    }
  }, [jobCount, milestoneValues, showMilestoneToast]);

  useEffect(() => {
    if (streak >= 1) {
      showMilestoneToast("streak", streak);
    }
  }, [streak, showMilestoneToast]);

  useEffect(() => {
    if (isTutorialActive && isNewUser && currentStep === 'addButton' && !isNavigated) {
      const timer = setTimeout(() => {
        onNavigateToApplications?.();
        setIsNavigated(true);
      }, 300);
      return () => clearTimeout(timer);
    }
    if (isTutorialActive && isNewUser && currentStep === 'pipeline') {
      onNavigateToApplications?.();
    }
  }, [isTutorialActive, isNewUser, currentStep, onNavigateToApplications, isNavigated]);

  useEffect(() => {
    if (!isTutorialActive || currentStep !== 'addButton') {
      setIsNavigated(false);
    }
  }, [isTutorialActive, currentStep]);

  const addButtonSelector = isDesktop ? "[data-tutorial='add-button-desktop']" : "[data-tutorial='add-button-mobile']";

  return (
    <>
      <WelcomeModal />
      <CelebrationModal />
      
      {isTutorialActive && isNewUser && currentStep === 'addButton' && isNavigated && (
        <SpotlightTooltip
          targetSelector={addButtonSelector}
          step="addButton"
          title={t("tutorial.addButton.title")}
          description={t("tutorial.addButton.desc")}
          position="bottom"
        />
      )}

      {isTutorialActive && isNewUser && currentStep === 'pipeline' && (
        <SpotlightTooltip
          targetSelector="[data-tutorial='pipeline-filters']"
          step="pipeline"
          title={t("tutorial.pipeline.title")}
          description={t("tutorial.pipeline.desc")}
          centered
        >
          <PipelineVisual />
        </SpotlightTooltip>
      )}
    </>
  );
}