// ─── DESIGN TOKENS — LIGHT PROFESSIONAL PALETTE ────────────────────────────

/** Acid tones readable on white for text, badges, and table values. */
export const ACID = {
  lime:    "#6B9A00",
  cyan:    "#007FA3",
  magenta: "#B8009E",
  orange:  "#D95600",
  yellow:  "#9A7200",
  green:   "#0A8F3E",
  purple:  "#6229FF",
  red:     "#C41E3A",
  pink:    "#C4006E",
  blue:    "#1A56C4",
}

/** Brighter acid for chart fills, bars, and swatches (not small text). */
export const ACID_FILL = {
  lime:    "#8DB500",
  cyan:    "#00A3C4",
  magenta: "#D400B8",
  orange:  "#FF6B00",
  yellow:  "#C49200",
  green:   "#12B84E",
  purple:  "#7C4DFF",
  red:     "#E82E4A",
  pink:    "#E6007E",
  blue:    "#2E6FE8",
}

const LEGACY_NEON = {
  CCFF00: ACID.lime,
  "00F0FF": ACID.cyan,
  "39FF14": ACID.green,
  FFE600: ACID.yellow,
  FF6600: ACID.orange,
  FF00AA: ACID.magenta,
  "0066FF": ACID.blue,
  FF2244: ACID.red,
  FF1493: ACID.pink,
  B400FF: ACID.purple,
}

const READABLE_TO_FILL = {
  [ACID.lime]: ACID_FILL.lime,
  [ACID.cyan]: ACID_FILL.cyan,
  [ACID.magenta]: ACID_FILL.magenta,
  [ACID.orange]: ACID_FILL.orange,
  [ACID.yellow]: ACID_FILL.yellow,
  [ACID.green]: ACID_FILL.green,
  [ACID.purple]: ACID_FILL.purple,
  [ACID.red]: ACID_FILL.red,
  [ACID.pink]: ACID_FILL.pink,
  [ACID.blue]: ACID_FILL.blue,
}

export function toHex(color) {
  if (!color) return "#6b7280"
  const s = String(color).trim()
  return s.startsWith("#") ? s : `#${s}`
}

/** Map legacy neon / raw hex to a readable acid tone on white backgrounds. */
export function readableAccent(color) {
  const raw = String(color ?? "").replace("#", "").toUpperCase()
  if (LEGACY_NEON[raw]) return LEGACY_NEON[raw]
  return toHex(color)
}

/** Brighter companion for fills while keeping readable text separate. */
export function accentFill(color) {
  const readable = readableAccent(color)
  return READABLE_TO_FILL[readable] ?? readable
}

export const CHART = {
  primary:   ACID.purple,
  secondary: ACID.cyan,
  tertiary:  ACID.magenta,
  grid:      "#e5e7eb",
  series:    [ACID.purple, ACID.cyan, ACID.magenta, ACID.orange, ACID.green, ACID.blue, ACID.yellow, ACID.pink, ACID.red],
  fills:     [ACID_FILL.purple, ACID_FILL.cyan, ACID_FILL.magenta, ACID_FILL.orange, ACID_FILL.green, ACID_FILL.blue, ACID_FILL.yellow, ACID_FILL.pink, ACID_FILL.red],
  tools:     { Chat: ACID.green, "Coding IDE": ACID.cyan, Excel: ACID.magenta },
  toolFills: { Chat: ACID_FILL.green, "Coding IDE": ACID_FILL.cyan, Excel: ACID_FILL.magenta },
  tiers:     { Instant: ACID.lime, Thinking: ACID.purple, Pro: ACID.cyan },
  tierFills: { Instant: ACID_FILL.lime, Thinking: ACID_FILL.purple, Pro: ACID_FILL.cyan },
  segments:  [ACID.purple, ACID.cyan, ACID.orange, "#6b7280"],
}

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
  cyanDk:   "#007FA3",
  amber:    ACID.orange,
  amberDk:  "#D95600",
  red:      "#C41E3A",
  redDk:    "#A31830",
  green:    "#0A8F3E",
  greenDk:  "#087032",
  violet:   "#6229FF",

  border:   "#ebe9f0",
  shadow:   "0 1px 3px rgba(31, 31, 31, 0.04), 0 1px 2px rgba(31, 31, 31, 0.03)",
  shadowMd: "0 4px 16px rgba(31, 31, 31, 0.06)",
}

export const glass = {
  background: C.surface,
  border: `1px solid ${C.glassBorder}`,
  borderRadius: 12,
  boxShadow: C.shadow,
}

/** Department accent keys — hex without # for data bundles. */
export const DEPT_COLORS = {
  Technology:           "6B9A00",
  "Data & Analytics":   "007FA3",
  "Customer Support":   "0A8F3E",
  Pricing:              "9A7200",
  Finance:              "D95600",
  "Sales & Part.":      "B8009E",
  "Sales & Partnerships": "B8009E",
  Underwriting:         "1A56C4",
  "Risk & Compliance":  "C41E3A",
  People:               "C4006E",
  Unknown:              "64748B",
}

export const DEPT_COLOR = Object.fromEntries(
  Object.entries(DEPT_COLORS).map(([k, v]) => [k, `#${v}`])
)

export const LOCALE = "en-US"

export const LAYOUT = {
  sidebarWidth: 72,
  sidebarExpandedWidth: 268,
}
