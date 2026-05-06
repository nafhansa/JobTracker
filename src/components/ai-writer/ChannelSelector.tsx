"use client";

import { Mail, MessageSquare, Instagram, ArrowRight } from "lucide-react";
import { ColdChannel, CHANNEL_OPTIONS, GenerationType } from "@/lib/ai/types";

interface ChannelSelectorProps {
  onSelect: (channel: ColdChannel, type: GenerationType) => void;
  onBack: () => void;
}

const CHANNEL_DATA: { channel: ColdChannel; type: GenerationType; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { channel: "email", type: "cold_email", icon: Mail, description: "Professional cold email outreach" },
  { channel: "linkedin", type: "cold_linkedin", icon: MessageSquare, description: "LinkedIn connection message" },
  { channel: "instagram", type: "cold_dm_instagram", icon: Instagram, description: "Instagram direct message" },
  { channel: "whatsapp", type: "cold_wa", icon: MessageSquare, description: "WhatsApp direct message" },
];

export default function ChannelSelector({ onSelect, onBack }: ChannelSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Choose a channel</h2>
        <p className="text-sm text-muted-foreground">Where will you send this message?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CHANNEL_DATA.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.channel}
              onClick={() => onSelect(c.channel, c.type)}
              className="group flex flex-col items-center gap-2 p-4 sm:p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-foreground text-sm">
                {CHANNEL_OPTIONS.find((o) => o.value === c.channel)?.label || c.channel}
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">{c.description}</div>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          );
        })}
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