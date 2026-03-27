"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useOnboarding } from "@/lib/onboarding/context";
import { Globe } from "lucide-react";
import { useState } from "react";

const languages = [
  { code: "en" as const, name: "English", flag: "🇬🇧", description: "Continue in English" },
  { code: "id" as const, name: "Indonesia", flag: "🇮🇩", description: "Lanjutkan dalam Bahasa Indonesia" },
];

export default function LanguageSelectionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setLanguage } = useOnboarding();
  const [selected, setSelected] = useState<"en" | "id" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (lang: "en" | "id") => {
    if (!user) return;
    
    setSelected(lang);
    setLoading(true);
    
    try {
      setLanguage(lang);
      
      await fetch("/api/users/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, language: lang }),
      });

      router.push("/onboarding/questions");
    } catch (error) {
      console.error("Error saving language:", error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
          <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1.5 sm:mb-2">
          Select Language
        </h1>
        <p className="text-muted-foreground text-xs sm:text-base">
          Pilih bahasa yang kamu inginkan
        </p>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            disabled={loading}
            className={`
              w-full p-3.5 sm:p-5 rounded-xl border-2 transition-all duration-200
              flex items-center gap-3 sm:gap-4 text-left
              ${selected === lang.code
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card"
              }
              ${loading ? "opacity-50 cursor-wait" : "cursor-pointer"}
            `}
          >
            <span className="text-2xl sm:text-4xl">{lang.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground text-sm sm:text-lg">
                {lang.name}
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm truncate">
                {lang.description}
              </div>
            </div>
            {selected === lang.code && (
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}