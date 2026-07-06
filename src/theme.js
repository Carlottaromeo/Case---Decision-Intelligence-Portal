// ─── DESIGN TOKENS — LIGHT PROFESSIONAL PALETTE ────────────────────────────

export const ACID = {
  lime:    "#22c55e",
  cyan:    "#0ea5e9",
  magenta: "#a855f7",
  orange:  "#f97316",
  yellow:  "#eab308",
  green:   "#16a34a",
  purple:  "#6366f1",
  red:     "#ef4444",
  pink:    "#ec4899",
  blue:    "#3b82f6",
};

export const CHART = {
  primary:   ACID.purple,
  secondary: ACID.cyan,
  tertiary:  ACID.magenta,
  grid:      "#e5e7eb",
  series:    [ACID.purple, ACID.cyan, ACID.magenta, ACID.orange, ACID.green, ACID.blue, ACID.yellow, ACID.pink, ACID.red],
  tools:     { Chat: ACID.green, "Coding IDE": ACID.cyan, Excel: ACID.magenta },
  tiers:     { Instant: ACID.green, Thinking: ACID.purple, Pro: ACID.cyan },
  segments:  [ACID.purple, ACID.cyan, ACID.orange, "#9ca3af"],
};

export const C = {
  bg:           "#F7F6FB",
  surface:      "#ffffff",
  surface2:     "#faf9fc",
  navDark:      "#1F1F1F",
  navSub:       "#e8eaef",
  navSubBorder: "#d8dce5",

  glass:        "#ffffff",
  glassHover:   "#f3f4f6",
  glassStrong:  "#ffffff",
  glassBorder:  "#ebe9f0",
  glassBorderL: "#ddd9e8",

  text:     "#1F1F1F",
  textSub:  "#374151",
  muted:    "#6b7280",
  subtle:   "#9ca3af",

  track:    "#ebe9f0",
  pillBg:   "#f3f2f7",
  rowAlt:   "#faf9fc",
  inputBg:  "#faf9fc",
  overlay:  "rgba(31, 31, 31, 0.45)",
  onAccent: "#ffffff",

  accent:     "#6229FF",
  accentDim:  "rgba(98, 41, 255, 0.08)",
  accentGlow: "rgba(98, 41, 255, 0.2)",

  indigo:   "#6229FF",
  indigoDk: "#5020d9",
  cyan:     ACID.cyan,
  cyanDk:   "#0284c7",
  amber:    ACID.orange,
  amberDk:  "#ea580c",
  red:      "#e5484d",
  redDk:    "#dc2626",
  green:    "#30a46c",
  greenDk:  "#15803d",
  violet:   "#6229FF",

  border:   "#ebe9f0",
  shadow:   "0 1px 3px rgba(31, 31, 31, 0.04), 0 1px 2px rgba(31, 31, 31, 0.03)",
  shadowMd: "0 4px 16px rgba(31, 31, 31, 0.06)",
};

export const glass = {
  background: C.surface,
  border: `1px solid ${C.glassBorder}`,
  borderRadius: 12,
  boxShadow: C.shadow,
};

export const DEPT_COLOR = {
  "Technology":           ACID.blue,
  "Data & Analytics":     ACID.cyan,
  "Customer Support":     ACID.green,
  "Pricing":              ACID.yellow,
  "Finance":              ACID.orange,
  "Sales & Part.":        ACID.magenta,
  "Sales & Partnerships": ACID.magenta,
  "Underwriting":         ACID.blue,
  "Risk & Compliance":    ACID.red,
  "People":               ACID.pink,
};

export const LOCALE = "en-US";

export const LAYOUT = {
  sidebarWidth: 72,
  sidebarExpandedWidth: 268,
};
