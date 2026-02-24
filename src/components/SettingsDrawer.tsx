"use client";

import { useState, useEffect } from "react";
import { X, LogOut, ShieldCheck, Sparkles, Moon, Sun, Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { logout } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  if (storedTheme) return storedTheme;
  return "light";
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const router = useRouter();
  const { user, subscription } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());

  const isAdminUser = (email?: string | null) => {
    return email === "admin@jobtracker.com" || email === "nafhan@gmail.com";
  };

  const isFreePlan = subscription?.plan === "free";

  useEffect(() => {
    setIsAdmin(isAdminUser(user?.email || null));
  }, [user?.email]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    router.push("/login");
  };

  const handleUpgrade = () => {
    router.push("/upgrade");
    onClose();
  };

  const handleAdmin = () => {
    router.push("/admin");
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 right-0 z-50 h-full w-72 bg-background dark:bg-card
          transform transition-transform duration-300 ease-in-out shadow-2xl
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Settings List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Theme & Language */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Appearance
            </h3>
            <div className="space-y-3">
              {/* Theme Card - Clickable */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-accent rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-foreground">Theme</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="text-xs capitalize">{theme}</span>
                </div>
              </button>

              {/* Language Card - Clickable */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-accent rounded-lg transition-colors">
                    <span className="text-sm font-medium text-foreground">Language</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Languages className="w-5 h-5" />
                      <span className="text-xs capitalize">{language}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-full">
                  <DropdownMenuItem
                    onClick={() => setLanguage("en")}
                    className={language === "en" ? "bg-accent" : ""}
                  >
                    <span className="mr-2">🇺🇸</span>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage("id")}
                    className={language === "id" ? "bg-accent" : ""}
                  >
                    <span className="mr-2">🇮🇩</span>
                    Indonesian
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Account
            </h3>
            <div className="space-y-3">
              {user?.email && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                </div>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-3" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* Subscription */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Subscription
            </h3>
            <div className="space-y-3">
              {isFreePlan && (
                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  <span>Upgrade to Pro</span>
                </Button>
              )}

              {isAdmin && (
                <Button
                  onClick={handleAdmin}
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <ShieldCheck className="w-4 h-4 mr-3" />
                  <span>Admin</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
