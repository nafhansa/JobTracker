"use client";

import { ArrowRight } from "lucide-react";
import { OutputLanguage, LANGUAGE_OPTIONS } from "@/lib/ai/types";

interface LanguageSelectorProps {
  onSelect: (language: OutputLanguage) => void;
  onBack: () => void;
}

export default function LanguageSelector({ onSelect, onBack }: LanguageSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Choose your language</h2>
        <p className="text-sm text-muted-foreground">Pick the language for your content</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LANGUAGE_OPTIONS.map((l) => (
          <button
            key={l.value}
            onClick={() => onSelect(l.value)}
            className="group flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
          >
            <span className="text-3xl">{l.flag}</span>
            <div className="flex-1">
              <div className="font-semibold text-foreground text-sm">{l.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {l.value === "en" ? "Professional English output" : "Output dalam Bahasa Indonesia"}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>

      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
}