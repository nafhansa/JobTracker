// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { PayPalProvider } from "@/components/providers/PayPalProvider"; // Import yang baru

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PayPalProvider>
            {children}
          </PayPalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}