"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { OnboardingProvider } from "@/lib/onboarding/context";
import { useAuth } from "@/lib/firebase/auth-context";
import { Loader2 } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user && !loading) {
        try {
          const res = await fetch(`/api/onboarding?userId=${user.uid}`);
          const data = await res.json();

          if (data.completed && pathname !== "/onboarding") {
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error checking onboarding:", error);
        }
      }
    };

    if (pathname === "/onboarding") {
      checkOnboarding();
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          {children}
        </div>
      </div>
    </OnboardingProvider>
  );
}