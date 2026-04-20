"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language/context";

export default function FooterSection() {
  const { t } = useLanguage();

  return (
    <footer className="py-12 border-t border-border bg-background relative z-10 text-sm">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="text-foreground font-bold tracking-widest uppercase mb-2">JobTracker</p>
          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} {t("footer.rights")}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-muted-foreground">
          <Link href="/terms-policy#terms" className="hover:text-primary transition-colors">{t("footer.terms")}</Link>
          <Link href="/terms-policy#privacy" className="hover:text-primary transition-colors">{t("footer.privacy")}</Link>
          <Link href="/terms-policy#refund" className="hover:text-primary transition-colors">{t("footer.refund")}</Link>
          <Link href="/terms-policy#contact" className="hover:text-primary transition-colors">{t("footer.contact")}</Link>
        </div>

        <div className="text-muted-foreground text-xs">
          <a href="mailto:official.jobtrackerapp@gmail.com" className="hover:text-foreground flex items-center gap-2 transition-colors">
            official.jobtrackerapp@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}