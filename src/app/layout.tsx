// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { PaddleProvider } from "@/components/providers/PaddleProvider";
import { LanguageProvider } from "@/lib/language/context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <PaddleProvider>
              {children}
            </PaddleProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}