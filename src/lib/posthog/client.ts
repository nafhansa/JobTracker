import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined" && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: "2026-01-30",
      autocapture: true,
      capture_pageview: false,
      capture_pageleave: true,
      session_recording: {
        recordCrossOriginIframes: true,
      },
      respect_dnt: false,
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
        (window as any).posthog = ph;

        const params = new URLSearchParams(window.location.search);
        const utmParams: Record<string, string> = {};
        ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid", "ttclid", "msclkid"].forEach((param) => {
          const value = params.get(param);
          if (value) utmParams[`$initial_${param}`] = value;
        });
        if (Object.keys(utmParams).length > 0) {
          ph.register_once(utmParams);
          ph.capture("$set", { $set_once: utmParams });
        }
      },
    });
    (posthog as any).__loaded = true;
    (window as any).posthog = posthog;
  }
  return posthog;
}

export { posthog };