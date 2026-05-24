import { posthog } from "./client";

export const trackSignUpStarted = (method: string) =>
  posthog.capture("sign_up_started", { method });

export const trackSignUpCompleted = (method: string) =>
  posthog.capture("sign_up_completed", { method });

export const trackLoginCompleted = (method: string) =>
  posthog.capture("login_completed", { method });

export const trackOnboardingStarted = () =>
  posthog.capture("onboarding_started");

export const trackOnboardingStep = (step: string) =>
  posthog.capture("onboarding_step_completed", { step });

export const trackOnboardingCompleted = (language: string) =>
  posthog.capture("onboarding_completed", { language });

export const trackPricingViewed = () =>
  posthog.capture("pricing_viewed");

export const trackCheckoutStarted = (plan: string, amount: number) =>
  posthog.capture("checkout_started", { plan, amount, currency: "IDR" });

export const trackPaymentCompleted = (plan: string, amount: number, method: string) =>
  posthog.capture("payment_completed", { plan, amount, currency: "IDR", payment_method: method });

export const trackPaymentFailed = (plan: string, reason?: string) =>
  posthog.capture("payment_failed", { plan, reason });

export const trackSubscriptionCancelled = (plan: string) =>
  posthog.capture("subscription_cancelled", { plan });

export const trackAIWriterOpened = () =>
  posthog.capture("ai_writer_opened");

export const trackAIGenerationStarted = (type: "cover_letter" | "cold_outreach") =>
  posthog.capture("ai_generation_started", { type });

export const trackAIGenerationCompleted = (type: string, coins_remaining: number) =>
  posthog.capture("ai_generation_completed", { type, coins_remaining });

export const trackJPsPurchased = (package_name: string, coins: number, amount: number) =>
  posthog.capture("jps_purchased", { package_name, coins, amount, currency: "IDR" });

export const trackJobAdded = (source: string) =>
  posthog.capture("job_added", { source });

export const trackJobStatusChanged = (from: string, to: string) =>
  posthog.capture("job_status_changed", { from_status: from, to_status: to });

export const trackJobDeleted = () =>
  posthog.capture("job_deleted");

export const trackClientAdded = () =>
  posthog.capture("client_added");

export const trackFreelanceModeSwitched = () =>
  posthog.capture("switched_to_freelance_mode");

export const trackResumeUploaded = () =>
  posthog.capture("resume_uploaded");

export const trackProfileUpdated = () =>
  posthog.capture("profile_updated");

export const trackGmailConnected = () =>
  posthog.capture("gmail_connected");

export const trackColdOutreachSent = (channel: string) =>
  posthog.capture("cold_outreach_sent", { channel });

export const trackSidebarSection = (section: string) =>
  posthog.capture("sidebar_section_viewed", { section });

export const trackTrackerModeSwitched = (mode: "job" | "client") =>
  posthog.capture("tracker_mode_switched", { mode });

export const trackJobSearchPerformed = (sites: string[], resultsCount: number) =>
  posthog.capture("job_search_performed", { sites, results_count: resultsCount });

export const trackJobSearchBookmarked = (site: string, title: string) =>
  posthog.capture("job_search_bookmarked", { site, title });

export const trackJobSearchImported = (site: string) =>
  posthog.capture("job_search_imported", { site });