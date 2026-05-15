"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useAuth } from "@/lib/firebase/auth-context";
import { initPostHog } from "./client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function PostHogIdentify() {
  const { user, isPro, subscription } = useAuth();

  useEffect(() => {
    if (user) {
      posthog.identify(user.uid, {
        email: user.email,
        name: user.displayName,
        plan: subscription?.plan || "free",
        is_pro: isPro,
        sign_up_method: user.providerData[0]?.providerId || "unknown",
      });
      posthog.group("subscription", subscription?.plan || "free", {
        plan: subscription?.plan || "free",
        status: subscription?.status || "active",
      });
    } else {
      posthog.reset();
    }
  }, [user, isPro, subscription]);

  return null;
}