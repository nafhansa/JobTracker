// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { PaddleProvider } from "@/components/providers/PaddleProvider";
import { LanguageProvider } from "@/lib/language/context";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { SplashScreen } from "@/components/SplashScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
      </head>
      <body>
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              <PaddleProvider>
                <SplashScreen />
                {children}
                <PWAInstallBanner />
              </PaddleProvider>
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}