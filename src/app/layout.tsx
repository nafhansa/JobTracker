// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { LanguageProvider } from "@/lib/language/context";
import { ThemeProvider } from "@/lib/theme/context";
import { PostHogProvider, PostHogIdentify } from "@/lib/posthog/PostHogProvider";
import { PostHogPageView } from "@/lib/posthog/PostHogPageView";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { SplashScreen } from "@/components/SplashScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { MetaPixel } from "@/lib/meta-pixel/MetaPixel";
import type { Viewport } from "next";
import { Suspense } from "react";

export const metadata = {
  title: "Job Tracker Indonesia | Track Lamaran & AI Cover Letters",
  description: "Track job applications easily with JobTracker. Monitor lamaran, set reminders, & generate AI cover letters. No spreadsheets. Start free.",
  keywords: "job tracker Indonesia, aplikasi tracking lamaran, platform pencari kerja, AI job tracker, cover letter generator",
  manifest: "/manifest.json",
  canonical: "https://jobtracker.id",
  openGraph: {
    title: "Job Tracker Indonesia — Track Lamaran Dengan AI",
    description: "Platform pencari kerja #1 Indonesia. Track lamaran, set reminders, generate cover letters dengan AI. Gratis, no setup.",
    url: "https://jobtracker.id",
    siteName: "JobTracker",
    images: [
      {
        url: "https://jobtracker.id/og-image.png",
        width: 1200,
        height: 630,
        alt: "JobTracker - Job Application Tracker with AI Writer",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Job Tracker Indonesia",
    description: "Track lamaran kerja & generate AI cover letters. Start free.",
    images: ["https://jobtracker.id/twitter-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://jobtracker.id" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="en,id" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "JobTracker",
              description: "Platform tracking lamaran kerja dengan AI-powered cover letter generator. Kelola aplikasi kerja Anda dengan mudah.",
              url: "https://jobtracker.id",
              applicationCategory: "Productivity",
              operatingSystem: "Web, iOS, Android",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IDR",
                description: "Free plan available",
              },
              author: {
                "@type": "Organization",
                name: "JobTracker",
                url: "https://jobtracker.id",
                logo: "https://jobtracker.id/logo.png",
                sameAs: [
                  "https://twitter.com/jobtracker",
                  "https://instagram.com/jobtracker",
                  "https://linkedin.com/company/jobtracker",
                ],
              },
            }),
          }}
        />
        <MetaPixel />
      </head>
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <PostHogProvider>
                <Suspense fallback={null}>
                  <PostHogPageView />
                </Suspense>
                <AuthProvider>
                  <PostHogIdentify />
                  <SplashScreen />
                  {children}
                  <PWAInstallPrompt />
                  <Toaster />
                </AuthProvider>
              </PostHogProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}