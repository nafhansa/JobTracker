import { PostHog } from "posthog-node";

let posthogServer: PostHog | null = null;

export function getServerPostHog() {
  if (!posthogServer) {
    posthogServer = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
    });
  }
  return posthogServer;
}