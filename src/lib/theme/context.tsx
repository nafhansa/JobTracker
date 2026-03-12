"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export type ColorTheme = "default" | "aurora" | "sakura" | "meadow" | "ocean" | "lavender" | "warm-sand";
export type Mode = "light" | "dark";

interface ThemeContextType {
  colorTheme: ColorTheme;
  mode: Mode;
  setColorTheme: (theme: ColorTheme) => void;
  toggleMode: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COLOR_THEME_KEY = "color-theme";
const MODE_KEY = "theme";

const themeLabels: Record<ColorTheme, { name: string; emoji: string }> = {
  default: { name: "Ocean Blue", emoji: "🌊" },
  aurora: { name: "Aurora", emoji: "🌅" },
  sakura: { name: "Sakura", emoji: "🌸" },
  meadow: { name: "Meadow", emoji: "🌿" },
  ocean: { name: "Ocean Mist", emoji: "💨" },
  lavender: { name: "Lavender", emoji: "💜" },
  "warm-sand": { name: "Warm Sand", emoji: "🏜️" },
};

function getInitialColorTheme(): ColorTheme {
  if (typeof window === "undefined") return "default";
  const stored = localStorage.getItem(COLOR_THEME_KEY) as ColorTheme | null;
  if (stored && stored in themeLabels) return stored;
  return "default";
}

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(MODE_KEY) as Mode | null;
  if (stored === "light" || stored === "dark") return stored;
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(getInitialColorTheme);
  const [mode, setMode] = useState<Mode>(getInitialMode);
  const [mounted, setMounted] = useState(false);
  const initialized = useRef(false);

  const applyTheme = useCallback((theme: ColorTheme, modeValue: Mode) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (modeValue === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    applyTheme(colorTheme, mode);

    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, [colorTheme, mode, applyTheme]);

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem(COLOR_THEME_KEY, theme);
    applyTheme(theme, mode);
  }, [mode, applyTheme]);

  const toggleMode = useCallback(() => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem(MODE_KEY, newMode);
    applyTheme(colorTheme, newMode);
  }, [mode, colorTheme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ colorTheme, mode, setColorTheme, toggleMode, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { themeLabels };