"use client";

import GenerationOutput from "./GenerationOutput";
import { ArrowLeft } from "lucide-react";
import { GenerationType, GENERATION_TYPE_LABELS } from "@/lib/ai/types";

interface CreationDetailProps {
  content: string;
  type: GenerationType;
  targetCompany?: string;
  targetRole?: string;
  documentId?: string;
  onBack: () => void;
}

export default function CreationDetail({
  content,
  type,
  targetCompany,
  targetRole,
  documentId,
  onBack,
}: CreationDetailProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-xs text-muted-foreground">
          {targetCompany ? `${GENERATION_TYPE_LABELS[type]} · ${targetCompany}` : GENERATION_TYPE_LABELS[type]}
        </span>
      </div>
      <GenerationOutput
        content={content}
        type={type}
        targetCompany={targetCompany}
        targetRole={targetRole}
        documentId={documentId}
        onDismiss={onBack}
      />
    </div>
  );
}