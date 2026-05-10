import { useContext } from "react";
import { ThemeContext } from "../Context/themeContext.context";
import type { ThemeContextType } from "../types/theme.types";

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

export function useThemeColors() {
  return useTheme().theme.colors;
}

export function useThemeMode() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return { mode: theme.mode, toggleTheme, setTheme };
}
