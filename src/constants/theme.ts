/**
 * Central theme tokens for the whole app.
 *
 * This is the single source of truth for colors. Prefer referencing
 * `theme.*` over hardcoding hex/rgba values so the palette can be
 * re-skinned in one place.
 */

// Raw brand palette -----------------------------------------------------------
const palette = {
  green: "#52B788",
  greenDark: "#2D6A4F",
  gold: "#FFD700",
  red: "#FF4444",
  white: "#ffffff",
  black: "#000000",
  night: "#1A1A1A",
  surface: "#222222",
  gray888: "#888888",
  gray666: "#666666",
  gray333: "#333333",
  grayCcc: "#cccccc",
  switchTrackOff: "#767577",
  switchThumbOff: "#f4f3f4",
};

// Semantic tokens -------------------------------------------------------------
export const theme = {
  // Brand
  primary: palette.green,
  primaryDark: palette.greenDark,
  accent: palette.gold,
  danger: palette.red,

  // Surfaces & text
  background: palette.night,
  surface: palette.surface,
  text: palette.white,
  textMuted: palette.gray888,
  textFaint: palette.grayCcc,
  white: palette.white,
  black: palette.black,
  gray600: palette.gray666,
  border: palette.gray333,

  // Play-area wall (brown)
  wall: "#8B5A2B",

  // Form controls
  switchTrackOff: palette.switchTrackOff,
  switchThumbOff: palette.switchThumbOff,

  // White alpha (dividers, translucent cards, faint text)
  whiteA10: "rgba(255, 255, 255, 0.1)",
  whiteA60: "rgba(255, 255, 255, 0.6)",
  whiteA80: "rgba(255, 255, 255, 0.8)",

  // Black alpha (overlays)
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayMedium: "rgba(0, 0, 0, 0.5)",
  overlayHeavy: "rgba(0, 0, 0, 0.8)",

  // Primary (green) alpha
  primaryA05: "rgba(82, 183, 136, 0.05)",
  primaryA10: "rgba(82, 183, 136, 0.1)",
  primaryA15: "rgba(82, 183, 136, 0.15)",
  primaryA50: "rgba(82, 183, 136, 0.5)",

  // Accent / danger alpha
  goldA10: "rgba(255, 215, 0, 0.1)",
  dangerA10: "rgba(255, 68, 68, 0.1)",

  // Hazard red (restricted zones / danger tiles in later levels)
  hazardA20: "rgba(255, 0, 0, 0.2)",
  hazardA50: "rgba(255, 0, 0, 0.5)",

  // Locked-level styling on the home grid
  lockedSurface: "rgba(100, 100, 100, 0.15)",
  lockedBorder: "rgba(102, 102, 102, 0.3)",
} as const;

export type Theme = typeof theme;

export default theme;
