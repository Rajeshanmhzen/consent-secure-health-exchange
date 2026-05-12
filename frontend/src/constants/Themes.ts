export const Colors = {
  light: {
    primary: "#8B7CF6",
    primaryLight: "#C4B5FD",
    primaryDark: "#6D5AE6",
    primaryGhost: "rgba(139, 124, 246, 0.08)",
    background: "#F9F9FF",
    backgroundAlt: "#F1F5F9",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    sidebarBackground: "#FFFFFF",
    inputBackground: "#F8FAFC",
    tableRowHover: "#F5F3FF",
    overlay: "rgba(15, 23, 42, 0.4)",
    border: "#E5E7EB",
    borderStrong: "#D1D5DB",

    text: "#1F2937",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    textOnPrimary: "#FFFFFF",
    textDisabled: "#9CA3AF",

    link: "#6D5AE6",
    accent: "#60A5FA",

    success: "#22C55E",
    successLight: "#DCFCE7",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    error: "#EF4444",
    errorLight: "#FEE2E2",
    info: "#3B82F6",
    infoLight: "#DBEAFE",

    disabled: "#D1D5DB",
    focusRing: "rgba(139, 124, 246, 0.4)",
    scrollbar: "#E5E7EB",
    scrollbarThumb: "#C4B5FD",
  },
  dark: {
    primary: "#A78BFA",
    primaryLight: "#C4B5FD",
    primaryDark: "#8B7CF6",
    primaryGhost: "rgba(167, 139, 250, 0.1)",

    background: "#0F172A",
    backgroundAlt: "#0B1120",
    surface: "#151f32",
    surfaceElevated: "#1a2540",
    sidebarBackground: "#151f32",
    inputBackground: "#151f32",
    tableRowHover: "#2D3A4F",
    overlay: "rgba(0, 0, 0, 0.6)",

    border: "#334155",
    borderStrong: "#475569",

    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    textTertiary: "#64748B",
    textOnPrimary: "#0F172A",
    textDisabled: "#475569",
    link: "#C4B5FD",

    accent: "#60A5FA",

    success: "#4ADE80",
    successLight: "rgba(74, 222, 128, 0.12)",
    warning: "#FBBF24",
    warningLight: "rgba(251, 191, 36, 0.12)",
    error: "#F87171",
    errorLight: "rgba(248, 113, 113, 0.12)",
    info: "#60A5FA",
    infoLight: "rgba(96, 165, 250, 0.12)",

    disabled: "#475569",
    focusRing: "rgba(167, 139, 250, 0.4)",
    scrollbar: "#1E293B",
    scrollbarThumb: "#475569",
  },
} as const;

export const Typography = {
  heading1: { fontSize: "2rem",     fontWeight: "700", lineHeight: "2.5rem",   fontFamily: "Lexend, sans-serif" },
  heading2: { fontSize: "1.75rem",  fontWeight: "700", lineHeight: "2.25rem",  fontFamily: "Lexend, sans-serif" },
  heading3: { fontSize: "1.5rem",   fontWeight: "600", lineHeight: "2rem",     fontFamily: "Lexend, sans-serif" },
  heading4: { fontSize: "1.25rem",  fontWeight: "600", lineHeight: "1.75rem",  fontFamily: "Lexend, sans-serif" },
  heading5: { fontSize: "1.125rem", fontWeight: "600", lineHeight: "1.625rem", fontFamily: "Lexend, sans-serif" },
  heading6: { fontSize: "1rem",     fontWeight: "600", lineHeight: "1.5rem",   fontFamily: "Lexend, sans-serif" },
  body:      { fontSize: "1rem",     fontWeight: "400", lineHeight: "1.5rem",   fontFamily: "Lexend, sans-serif" },
  bodySmall: { fontSize: "0.875rem", fontWeight: "400", lineHeight: "1.25rem",  fontFamily: "Lexend, sans-serif" },
  label:     { fontSize: "0.875rem", fontWeight: "500", lineHeight: "1.25rem",  fontFamily: "Lexend, sans-serif" },
  caption:   { fontSize: "0.75rem",  fontWeight: "400", lineHeight: "1rem",     fontFamily: "Lexend, sans-serif" },
  xs:        { fontSize: "0.625rem", fontWeight: "400", lineHeight: "0.875rem", fontFamily: "Lexend, sans-serif" },
  mono:      { fontSize: "0.875rem", fontWeight: "400", lineHeight: "1.25rem",  fontFamily: "'Space Mono', monospace" },
} as const;

export const Spacing = {
  xs:  "0.25rem",
  sm:  "0.5rem",
  md:  "0.75rem",
  lg:  "1rem",
  xl:  "1.5rem",
  "2xl": "2rem",
  "3xl": "3rem",
  "4xl": "4rem",
} as const;

export const BorderRadius = {
  small:  "0.25rem",
  medium: "0.5rem",
  large:  "0.75rem",
  xl:     "1rem",
  "2xl":  "1.5rem",
  full:   "9999px",
} as const;

export const Shadows = {
  none:    "none",
  sm:      "0 1px 2px rgba(0, 0, 0, 0.08)",
  md:      "0 4px 12px rgba(0, 0, 0, 0.1)",
  lg:      "0 8px 24px rgba(0, 0, 0, 0.12)",
  xl:      "0 16px 40px rgba(0, 0, 0, 0.16)",
  primary: "0 4px 14px rgba(139, 124, 246, 0.4)",
} as const;

export const ZIndex = {
  base:    0,
  raised:  10,
  dropdown: 100,
  sticky:  200,
  overlay: 300,
  modal:   400,
  toast:   500,
  tooltip: 600,
} as const;

export const Transitions = {
  fast:   "150ms ease",
  normal: "250ms ease",
  slow:   "400ms ease",
} as const;

export const Breakpoints = {
  sm:  "640px",
  md:  "768px",
  lg:  "1024px",
  xl:  "1280px",
  "2xl": "1536px",
} as const;

export const AvatarSizes = {
  xs: "2rem",
  sm: "2.75rem",
  md: "3.375rem",
  lg: "4.5rem",
} as const;

export type AvatarSize    = keyof typeof AvatarSizes;
export type ThemeColors   = typeof Colors.light;
export type ColorName     = keyof ThemeColors;
export type SpacingKey    = keyof typeof Spacing;
export type BreakpointKey = keyof typeof Breakpoints;
