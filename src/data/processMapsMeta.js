import { C } from "../theme"

export const LEVEL_COLORS = {
  High: C.indigoDk,
  Medium: C.cyanDk,
  Low: "#6b7280",
}

export const ACTION_COLORS = {
  Scale: C.accent,
  Industrialize: C.cyanDk,
  Activate: C.amber,
  "Quick win": C.violet,
  Monitor: C.muted,
}

export const ACTION_ORDER = {
  Scale: 0,
  Industrialize: 1,
  Activate: 2,
  "Quick win": 3,
  Monitor: 4,
}

export const LEVEL_ORDER = { High: 0, Medium: 1, Low: 2 }

export function deptColor(color) {
  return color?.startsWith("#") ? color : `#${color}`
}
