"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, X, FileText, Mail, MessageSquare, Instagram } from "lucide-react";
import { GenerationType, GENERATION_TYPE_LABELS } from "@/lib/ai/types";

interface GenerationOutputProps {
  content: string;
  type: GenerationType;
  onDismiss: () => void;
}

export default function GenerationOutput({ content, type, onDismiss }: GenerationOutputProps) {
  const [copied, setCopied] = useState(false);

  const typeIcon = () => {
    switch (type) {
      case "cover_letter": return <FileText className="w-4 h-4" />;
      case "cold_email": return <Mail className="w-4 h-4" />;
      case "cold_dm_instagram": return <Instagram className="w-4 h-4" />;
      case "cold_wa": return <MessageSquare className="w-4 h-4" />;
      case "cold_linkedin": return <Mail className="w-4 h-4" />;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            {typeIcon()}
            {GENERATION_TYPE_LABELS[type]}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">
            {content}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}