"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronUp, Zap } from "lucide-react";
import {
  GenerationType,
  ToneType,
  GenerationFormat,
  ColdChannel,
  OutputLanguage,
  LANGUAGE_OPTIONS,
  TONE_OPTIONS,
  INTENT_OPTIONS,
  CoinsBalance,
  COINS_PER_GENERATION,
  UserProfile,
  MessageIntent,
} from "@/lib/ai/types";

interface CustomizeStepProps {
  type: GenerationType;
  channel?: ColdChannel;
  language: OutputLanguage;
  tone: ToneType;
  format: GenerationFormat;
  customContext: string;
  profile: UserProfile | null;
  coins: CoinsBalance | null;
  isAdmin: boolean;
  intent: MessageIntent | null;
  onLanguageChange: (l: OutputLanguage) => void;
  onToneChange: (t: ToneType) => void;
  onFormatChange: (f: GenerationFormat) => void;
  onCustomContextChange: (c: string) => void;
  onIntentChange: (i: MessageIntent | null) => void;
  onGenerate: () => void;
  onBack: () => void;
}

export default function CustomizeStep({
  type,
  channel,
  language,
  tone,
  format,
  customContext,
  profile,
  coins,
  isAdmin,
  intent,
  onLanguageChange,
  onToneChange,
  onFormatChange,
  onCustomContextChange,
  onIntentChange,
  onGenerate,
  onBack,
}: CustomizeStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const hasInsufficientCoins = !isAdmin && (!coins || coins.total_coins < COINS_PER_GENERATION);
  const typeLabel = type === "cover_letter" ? "Cover Letter" : channel
    ? ({ email: "Cold Email", linkedin: "LinkedIn Message", instagram: "Instagram DM", whatsapp: "WhatsApp Message" } as Record<string, string>)[channel] || "Cold Outreach"
    : "Cold Outreach";

  const isColdType = type !== "cover_letter";
  const filteredIntents = INTENT_OPTIONS.filter((opt) => !opt.coldOnly || isColdType);

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Customize your {type === "cover_letter" ? "cover letter" : "message"}</h2>
        <p className="text-sm text-muted-foreground">Adjust the tone and details before generating</p>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-medium text-muted-foreground">Language</label>
        <div className="flex gap-2">
          {LANGUAGE_OPTIONS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => onLanguageChange(l.value)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                language === l.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-medium text-muted-foreground">Tone</label>
        <div className="flex gap-2 flex-wrap">
          {TONE_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onToneChange(t.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                tone === t.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-medium text-muted-foreground">Purpose</label>
        <div className="flex flex-col gap-2">
          {filteredIntents.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onIntentChange(intent === opt.value ? null : opt.value)}
              className={`flex items-start gap-2.5 px-3.5 py-2 rounded-xl text-left transition-all ${
                intent === opt.value
                  ? "bg-primary/10 border-2 border-primary text-foreground"
                  : "bg-muted/50 border-2 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex-1">
                <span className="text-xs font-semibold">{opt.label}</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
              {intent === opt.value && (
                <span className="text-primary text-xs mt-0.5">&#10003;</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {type === "cover_letter" && (
        <div className="space-y-2.5">
          <label className="text-xs font-medium text-muted-foreground">Format</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onFormatChange("full_letter")}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                format === "full_letter"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Full Letter
            </button>
            <button
              type="button"
              onClick={() => onFormatChange("body_only")}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                format === "body_only"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Body Only
            </button>
          </div>
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <span>Additional details</span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {showAdvanced && (
          <div className="px-4 pb-4 border-t border-border">
            <div className="space-y-2 pt-4">
              <label className="text-xs font-medium text-muted-foreground">
                Additional Notes <span className="text-[10px]">(optional)</span>
              </label>
              <textarea
                placeholder={
                  type === "cover_letter"
                    ? "Specific achievements, skills, or details you want highlighted..."
                    : "Any context about why you're reaching out, shared connections, etc..."
                }
                value={customContext}
                onChange={(e) => onCustomContextChange(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      {!profile?.summary && !profile?.skills?.length && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg text-sm">
          <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span className="text-amber-800 dark:text-amber-300 text-xs">
            Set up your <strong>Professional Profile</strong> in the Profile tab for more personalized results.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
        <Button
          onClick={onGenerate}
          disabled={hasInsufficientCoins}
          className="gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          Generate {typeLabel}
          {isAdmin ? (
            <span className="ml-0.5 opacity-70 text-xs">· admin</span>
          ) : (
            <span className="ml-0.5 opacity-70 text-xs">· 80 JPs</span>
          )}
        </Button>
      </div>
    </div>
  );
}