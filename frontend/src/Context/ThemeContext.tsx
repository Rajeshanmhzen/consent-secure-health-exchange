import React, { useEffect, useState } from "react";
import { BorderRadius, Breakpoints, Colors, Shadows, Spacing, Transitions, Typography, ZIndex } from "../constants/Themes";
import { ThemeContext } from "./themeContext.context";
import type { Theme, ThemeMode, ThemePreference, DarkVariant } from "../types/theme.types";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Load preferences from localStorage or default
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem("themePreference") as ThemePreference;
    return saved || "system";
  });

  const [darkVariant, setDarkVariantState] = useState<DarkVariant>(() => {
    const saved = localStorage.getItem("darkVariant") as DarkVariant;
    return saved || "classic";
  });

  const [resolvedMode, setResolvedMode] = useState<ThemeMode>("light");

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    localStorage.setItem("themePreference", pref);
  };

  const setDarkVariant = (variant: DarkVariant) => {
    setDarkVariantState(variant);
    localStorage.setItem("darkVariant", variant);
  };

  useEffect(() => {
    const updateResolvedMode = () => {
      if (themePreference === "light") {
        setResolvedMode("light");
      } else if (themePreference === "dark") {
        setResolvedMode("dark");
      } else {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setResolvedMode(isSystemDark ? "dark" : "light");
      }
    };

    updateResolvedMode();

    if (themePreference === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => updateResolvedMode();
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, [themePreference]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedMode);
  }, [resolvedMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-dark-variant", darkVariant);
  }, [darkVariant]);

  const theme: Theme = {
    mode: resolvedMode,
    colors: Colors[resolvedMode],
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
      toggleTheme: () => {
        setThemePreference(resolvedMode === "light" ? "dark" : "light");
      },
      setTheme: (mode: ThemeMode) => {
        setThemePreference(mode);
      },
      themePreference,
      setThemePreference,
      darkVariant,
      setDarkVariant,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
