// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { PaddleProvider } from "@/components/providers/PaddleProvider";
import { LanguageProvider } from "@/lib/language/context";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import type { Viewport } from "next";

export const metadata = {
  manifest: "/manifest.json",
  appleMobileWebAppCapable: "yes",
  appleMobileWebAppStatusBarStyle: "default",
  appleMobileWebAppTitle: "JobTracker",
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JobTracker" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-ios-180x180.png" />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <PaddleProvider>
              {children}
              <PWAInstallBanner />
            </PaddleProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}