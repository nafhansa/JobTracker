"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTutorial } from "@/lib/tutorial/context";
import { useLanguage } from "@/lib/language/context";
import { Sparkles, Rocket, ArrowRight } from "lucide-react";

export function WelcomeModal() {
  const { isTutorialActive, currentStep, isNewUser, nextStep, skipTutorial } = useTutorial();
  const { t } = useLanguage();

  const isOpen = isTutorialActive && isNewUser && currentStep === 'welcome';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && skipTutorial()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center sm:text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {t("tutorial.welcome.title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            {t("tutorial.welcome.desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={nextStep}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {t("tutorial.welcome.start")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="ghost"
            onClick={skipTutorial}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            {t("tutorial.welcome.skip")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}