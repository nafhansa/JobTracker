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

export const metadata = {
  manifest: "/manifest.json",
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
        <MetaPixel />
      </head>
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <PostHogProvider>
                <PostHogPageView />
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