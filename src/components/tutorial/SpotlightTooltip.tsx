"use client";

import { useEffect, useState, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useTutorial } from "@/lib/tutorial/context";
import { useLanguage } from "@/lib/language/context";
import { TutorialStep } from "@/lib/tutorial/types";
import { ArrowRight, X, Send, MessageSquare, UserCheck, ScrollText, ArrowRight as ArrowRightIcon } from "lucide-react";

interface SpotlightTooltipProps {
  targetSelector: string;
  step: TutorialStep;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  centered?: boolean;
  children?: ReactNode;
}

function PipelineVisual() {
  const stages = [
    { icon: Send, label: "Applied", color: "bg-blue-500" },
    { icon: MessageSquare, label: "Responded", color: "bg-yellow-500" },
    { icon: UserCheck, label: "Interview", color: "bg-orange-500" },
    { icon: ScrollText, label: "Offer", color: "bg-green-500" },
  ];

  return (
    <div className="flex items-center justify-center gap-1 my-4 p-3 bg-muted/30 rounded-lg">
      {stages.map((stage, index) => (
        <div key={stage.label} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full ${stage.color} flex items-center justify-center`}>
              <stage.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{stage.label}</span>
          </div>
          {index < stages.length - 1 && (
            <ArrowRightIcon className="w-4 h-4 text-muted-foreground mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

export function SpotlightTooltip({
  targetSelector,
  step,
  title,
  description,
  position = "bottom",
  centered = false,
  children,
}: SpotlightTooltipProps) {
  const { currentStep, isTutorialActive, nextStep, skipTutorial } = useTutorial();
  const { t } = useLanguage();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const isActive = isTutorialActive && currentStep === step;

  const updatePosition = useCallback(() => {
    if (centered) return;
    const target = document.querySelector(targetSelector);
    if (target) {
      setTargetRect(target.getBoundingClientRect());
    }
  }, [targetSelector, centered]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isActive) {
      if (centered) {
        setTargetRect({} as DOMRect);
        return;
      }
      
      updatePosition();
      
      const retryInterval = setInterval(() => {
        const target = document.querySelector(targetSelector);
        if (target) {
          setTargetRect(target.getBoundingClientRect());
          clearInterval(retryInterval);
        }
      }, 100);
      
      const handleResize = () => updatePosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize, true);
      
      return () => {
        clearInterval(retryInterval);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize, true);
      };
    }
  }, [isActive, updatePosition, targetSelector, centered]);

  if (!mounted || !isActive) return null;
  if (!centered && !targetRect) return null;

  const tooltipWidth = centered 
    ? Math.min(360, window.innerWidth - 32)
    : Math.min(320, window.innerWidth - 32);
  const padding = 24;
  const tooltipEstimatedHeight = centered ? 280 : 180;

  const clampLeft = (left: number) => {
    const minLeft = 16;
    const maxLeft = window.innerWidth - tooltipWidth - 16;
    return Math.max(minLeft, Math.min(left, maxLeft));
  };

  const clampTop = (top: number) => {
    const minTop = 16;
    const maxTop = window.innerHeight - tooltipEstimatedHeight - 16;
    return Math.max(minTop, Math.min(top, maxTop));
  };

  const getTooltipStyle = () => {
    if (centered) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    switch (position) {
      case "top": {
        const left = targetRect!.left + targetRect!.width / 2 - tooltipWidth / 2;
        const top = targetRect!.top - tooltipEstimatedHeight - padding;
        return {
          top: clampTop(top < 16 ? targetRect!.bottom + padding : top),
          left: clampLeft(left),
          transform: "none",
        };
      }
      case "bottom": {
        const left = targetRect!.left + targetRect!.width / 2 - tooltipWidth / 2;
        const top = targetRect!.bottom + padding;
        return {
          top: clampTop(top),
          left: clampLeft(left),
          transform: "none",
        };
      }
      case "left": {
        const left = targetRect!.left - tooltipWidth - padding;
        const top = targetRect!.top + targetRect!.height / 2 - tooltipEstimatedHeight / 2;
        return {
          top: clampTop(top),
          left: left < 16 ? targetRect!.right + padding : left,
          transform: "none",
        };
      }
      case "right": {
        const left = targetRect!.right + padding;
        const top = targetRect!.top + targetRect!.height / 2 - tooltipEstimatedHeight / 2;
        return {
          top: clampTop(top),
          left: left + tooltipWidth > viewportWidth - 16 ? targetRect!.left - tooltipWidth - padding : left,
          transform: "none",
        };
      }
      default: {
        const left = targetRect!.left + targetRect!.width / 2 - tooltipWidth / 2;
        const top = targetRect!.bottom + padding;
        return {
          top: clampTop(top),
          left: clampLeft(left),
          transform: "none",
        };
      }
    }
  };

  const tooltipStyle = getTooltipStyle();

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 9998,
    pointerEvents: "auto",
  };

  const highlightStyle: React.CSSProperties | null = centered ? null : {
    position: "fixed",
    top: targetRect!.top - 8,
    left: targetRect!.left - 8,
    width: targetRect!.width + 16,
    height: targetRect!.height + 16,
    backgroundColor: "transparent",
    borderRadius: "12px",
    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
    zIndex: 9999,
    pointerEvents: "none",
  };

  const tooltipContainerStyle: React.CSSProperties = {
    position: "fixed",
    ...tooltipStyle,
    width: tooltipWidth,
    zIndex: 10000,
    pointerEvents: "auto",
  };

  return createPortal(
    <>
      <div style={backdropStyle} onClick={skipTutorial} />
      {highlightStyle && <div style={highlightStyle} />}
      <div style={tooltipContainerStyle}>
        <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-foreground">{title}</h3>
            <button
              onClick={skipTutorial}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          {children}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={nextStep}
              size="sm"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("tutorial.next")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={skipTutorial}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              {t("tutorial.skip")}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export { PipelineVisual };