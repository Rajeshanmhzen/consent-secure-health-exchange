import type {
  BorderRadius,
  Breakpoints,
  Colors,
  Shadows,
  Spacing,
  Transitions,
  Typography,
  ZIndex,
} from "../constants/Themes";

export type ThemeMode = "light" | "dark";

export interface Theme {
  mode: ThemeMode;
  colors: typeof Colors.light | typeof Colors.dark;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  zIndex: typeof ZIndex;
  transitions: typeof Transitions;
  breakpoints: typeof Breakpoints;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}
