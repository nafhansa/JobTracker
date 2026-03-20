"use client";

import { useEffect } from "react";

export function ResetThemeToDefault() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", "default");
    
    return () => {
      // Re-apply saved theme when leaving the page
      const savedTheme = localStorage.getItem("color-theme") || "default";
      root.setAttribute("data-theme", savedTheme);
    };
  }, []);

  return null;
}