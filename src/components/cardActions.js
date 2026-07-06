import { C, ACID } from "../theme"

export const ACTION_BTN_SIZE = 22
export const ACTION_ICON_SIZE = 11
export const ACTION_BAR_OFFSET = 64

export const actionBtnBase = {
  width: ACTION_BTN_SIZE,
  height: ACTION_BTN_SIZE,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  flexShrink: 0,
  padding: 0,
}

export function insightBtnStyle(active) {
  return {
    ...actionBtnBase,
    border: `1px solid ${active ? ACID.purple : "rgba(99, 102, 241, 0.35)"}`,
    background: active ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.08)",
    boxShadow: active ? `0 0 0 2px rgba(99, 102, 241, 0.12)` : "none",
  }
}

export function infoBtnStyle(active) {
  return {
    ...actionBtnBase,
    border: `1px solid ${active ? ACID.cyan : "rgba(14, 165, 233, 0.35)"}`,
    background: active ? "rgba(14, 165, 233, 0.12)" : "rgba(14, 165, 233, 0.06)",
    boxShadow: active ? `0 0 0 2px rgba(14, 165, 233, 0.1)` : "none",
  }
}

export const actionBarStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: 3,
  borderRadius: 999,
  background: C.surface,
  border: `1px solid ${C.glassBorder}`,
  boxShadow: C.shadowMd,
}

export const INSIGHT_ICON_COLOR = "#4f46e5"
export const INFO_ICON_COLOR = "#0284c7"
