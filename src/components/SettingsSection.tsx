"use client";

import { LogOut, ShieldCheck, Moon, Sun, Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { useTheme } from "@/lib/theme/context";
import { logout } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SettingsSectionProps {
  isAdmin: boolean;
}

export default function SettingsSection({ isAdmin }: SettingsSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { mode, toggleMode, mounted } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleAdmin = () => {
    router.push("/admin");
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-card dark:bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 space-y-6">
            <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-card dark:bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Appearance
            </h3>
            <div className="space-y-3">
              <button
                onClick={toggleMode}
                className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-accent rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-foreground">Mode</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {mode === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="text-xs capitalize">{mode}</span>
                </div>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-accent rounded-lg transition-colors">
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

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Account
            </h3>
            <div className="space-y-3">
              {user?.email && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                </div>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-4"
              >
                <LogOut className="w-4 h-4 mr-3" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          <div>
            <div className="space-y-3">
              {isAdmin && (
                <Button
                  onClick={handleAdmin}
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent p-4"
                >
                  <ShieldCheck className="w-4 h-4 mr-3" />
                  <span>Admin</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
