"use client";

import { useState } from "react";
import { MessageSquare, Bug, Lightbulb, Star, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { submitFeedback } from "@/lib/supabase/feedback";
import { FeedbackType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const feedbackTypes: Array<{
  id: FeedbackType;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "general", icon: MessageSquare },
  { id: "bug", icon: Bug },
  { id: "feature", icon: Lightbulb },
];

export default function FeedbackSection() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [type, setType] = useState<FeedbackType>("general");
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async () => {
    if (!user?.uid || !message.trim() || rating === 0) return;

    setIsSubmitting(true);
    setStatus("idle");

    const result = await submitFeedback(
      user.uid,
      type,
      message.trim(),
      rating
    );

    setIsSubmitting(false);

    if (result.success) {
      setStatus("success");
      setMessage("");
      setRating(0);
      setType("general");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
    }
  };

  const selectedType = feedbackTypes.find((t) => t.id === type);
  const SelectedIcon = selectedType?.icon || MessageSquare;

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {t("feedback.title")}
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between p-4 bg-muted/30 hover:bg-accent rounded-lg transition-colors">
                <span className="text-sm font-medium text-foreground">
                  {t("feedback.type")}
                </span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <SelectedIcon className="w-4 h-4" />
                  <span className="text-xs capitalize">{t(`feedback.type.${type}`)}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {feedbackTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => setType(item.id)}
                    className={type === item.id ? "bg-accent" : ""}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {t(`feedback.type.${item.id}`)}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg gap-4">
            <span className="text-sm font-medium text-foreground shrink-0">
              {t("feedback.rating")}
            </span>
            <div className="flex gap-0.5 sm:gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none p-0.5"
                >
                  <Star
                    className={`w-5 h-5 sm:w-4 sm:h-4 transition-colors ${
                      star <= rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("feedback.message.placeholder")}
            rows={4}
            className="w-full p-4 bg-muted/30 hover:bg-muted/50 focus:bg-muted/50 border-0 rounded-lg text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
          />
        </div>

        {status === "success" && (
          <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{t("feedback.success")}</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{t("feedback.error")}</span>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || rating === 0 || isSubmitting}
          className="w-full gap-2"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? t("common.loading") : t("feedback.submit")}
        </Button>
      </div>
    </div>
  );
}