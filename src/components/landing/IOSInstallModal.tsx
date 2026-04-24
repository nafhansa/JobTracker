"use client";

import { Download, X } from "lucide-react";

interface IOSInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export default function IOSInstallModal({ open, onClose }: IOSInstallModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Install App
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">To install JobTracker on your iOS device:</p>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">1</span>
              <span>Tap the <strong className="text-primary">Share</strong> button <span className="text-lg">􀈂</span> in Safari</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">2</span>
              <span>Scroll down and tap <strong className="text-primary">Add to Home Screen</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">3</span>
              <span>Tap <strong className="text-primary">Add</strong> to install JobTracker</span>
            </li>
          </ol>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}