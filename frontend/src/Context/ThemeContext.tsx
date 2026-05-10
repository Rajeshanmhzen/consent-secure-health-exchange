import React, { useEffect, useState } from "react";
import { BorderRadius, Breakpoints, Colors, Shadows, Spacing, Transitions, Typography, ZIndex } from "../constants/Themes";
import { ThemeContext } from "./themeContext.context";
import type { Theme, ThemeMode } from "../types/theme.types";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setThemeMode(e.matches ? "dark" : "light");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  const theme: Theme = {
    mode: themeMode,
    colors: Colors[themeMode],
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    zIndex: ZIndex,
    transitions: Transitions,
    breakpoints: Breakpoints,
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme: () => setThemeMode((prev) => (prev === "light" ? "dark" : "light")),
      setTheme: setThemeMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
