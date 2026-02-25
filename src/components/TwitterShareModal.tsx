"use client";

import { useState } from "react";
import { X, Share2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TwitterShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const TWEET_TEMPLATE = `Baru aja nemu JobTracker App - aplikasi tracking lamaran kerja terbaik buat para pencari kerja! 🚀 Pantau semua status lamaranmu di satu tempat biar nggak ada kesempatan yang terlewat.

https://jobtrackerapp.site

#JobTracker #InfoLoker #Karir #JobSearch`;

export function TwitterShareModal({ isOpen, onClose, onConfirm }: TwitterShareModalProps) {
  const [hasShared, setHasShared] = useState(false);

  const handleShareToX = () => {
    const tweetText = encodeURIComponent(TWEET_TEMPLATE);
    window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
    setHasShared(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Share to Get Lifetime Access</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Unlock 20% discount by sharing on X
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-3">Post template:</p>
            <div className="bg-background border border-border rounded-md p-4 font-mono text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {TWEET_TEMPLATE}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleShareToX}
              className="w-full bg-black hover:bg-zinc-800 text-white font-medium dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share to X
            </Button>

            {hasShared && (
              <Button
                onClick={onConfirm}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                I've shared! Continue to Payment
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {hasShared ? "Click \"I've shared!\" to proceed to payment" : "After sharing, the continue button will appear below"}
          </p>
        </div>
      </div>
    </div>
  );
}