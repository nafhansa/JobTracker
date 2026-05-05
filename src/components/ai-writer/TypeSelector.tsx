"use client";

import { FileText, MessageSquare, ArrowRight, ArrowLeft } from "lucide-react";
import { GenerationType } from "@/lib/ai/types";

interface TypeSelectorProps {
  onSelect: (type: GenerationType) => void;
  onBack: () => void;
}

const types: { value: GenerationType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    value: "cover_letter",
    label: "Cover Letter",
    description: "Write a professional cover letter tailored to a specific job or company",
    icon: FileText,
  },
  {
    value: "cold_email",
    label: "Cold Outreach",
    description: "Write a cold email, LinkedIn message, Instagram DM, or WhatsApp message",
    icon: MessageSquare,
  },
];

export default function TypeSelector({ onSelect, onBack }: TypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-foreground">What would you like to create?</h2>
        <p className="text-sm text-muted-foreground">Choose the type of content you need</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {types.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => onSelect(t.value)}
              className="group flex flex-col items-start gap-3 p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{t.label}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.description}</div>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-primary mt-auto">
                Continue <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}