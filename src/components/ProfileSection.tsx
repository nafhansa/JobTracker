"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { User } from "lucide-react";
import ProfessionalProfile from "@/components/ai-writer/ProfessionalProfile";

interface ProfileSectionProps {
  isAdmin?: boolean;
}

export default function ProfileSection({ isAdmin: isAdminProp }: ProfileSectionProps = {}) {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground mb-1">{t("profile.userInfo")}</h2>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("profile.memberSince")}: {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  })
                : t("profile.unknown")}
            </p>
          </div>
        </div>
      </div>

      <ProfessionalProfile userId={user?.uid || ""} />
    </div>
  );
}