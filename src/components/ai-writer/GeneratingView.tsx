"use client";

import { motion } from "framer-motion";
import { Sparkles, FileText, Mail, MessageSquare, Instagram } from "lucide-react";
import { GenerationType } from "@/lib/ai/types";

interface GeneratingViewProps {
  type: GenerationType;
}

const TYPE_MESSAGES: Record<GenerationType, string> = {
  cover_letter: "Crafting your cover letter...",
  cold_email: "Writing your cold email...",
  cold_dm_instagram: "Composing your Instagram DM...",
  cold_wa: "Composing your WhatsApp message...",
  cold_linkedin: "Writing your LinkedIn message...",
};

function TypeIcon({ type }: { type: GenerationType }) {
  switch (type) {
    case "cover_letter": return <FileText className="w-8 h-8" />;
    case "cold_email": return <Mail className="w-8 h-8" />;
    case "cold_dm_instagram": return <Instagram className="w-8 h-8" />;
    case "cold_wa": return <MessageSquare className="w-8 h-8" />;
    case "cold_linkedin": return <Mail className="w-8 h-8" />;
  }
}

export default function GeneratingView({ type }: GeneratingViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <TypeIcon type={type} />
        </div>
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-5 h-5 text-primary" />
        </motion.div>
      </motion.div>

      <div className="text-center space-y-2">
        <motion.p
          className="text-lg font-semibold text-foreground"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {TYPE_MESSAGES[type]}
        </motion.p>
        <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
      </div>

      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}