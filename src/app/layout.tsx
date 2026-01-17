// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { PayPalProvider } from "@/components/providers/PayPalProvider";
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
            <PayPalProvider>
              {children}
            </PayPalProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}