import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined" && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      session_recording: {
        recordCrossOriginIframes: true,
      },
      respect_dnt: true,
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
        (window as any).posthog = ph;
      },
    });
    (posthog as any).__loaded = true;
    (window as any).posthog = posthog;
  }
  return posthog;
}

export { posthog };