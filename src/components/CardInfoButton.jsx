import { useEffect, useRef, useState } from "react"
import { C } from "../theme"
import { infoBtnStyle, INFO_ICON_COLOR, ACTION_ICON_SIZE } from "./cardActions"

function IconInfo({ size = ACTION_ICON_SIZE, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.2" />
      <path d="M12 11v5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.4" fill={color} />
    </svg>
  )
}

export default function CardInfoButton({ items, title = "How to use this view", overlay = true }) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const rootRef = useRef(null)
  const active = open || hover

  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (!items?.length) return null

  return (
    <div
      ref={rootRef}
      style={overlay
        ? { position: "absolute", top: 12, right: 12, zIndex: 6 }
        : { position: "relative", flexShrink: 0 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={title}
        aria-expanded={open}
        style={infoBtnStyle(active)}
      >
        <IconInfo size={ACTION_ICON_SIZE} color={active ? C.cyanDk : INFO_ICON_COLOR} />
      </button>

      {hover && !open && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            zIndex: 60,
            padding: "7px 11px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.35,
            color: C.text,
            background: C.surface,
            border: `1px solid ${C.glassBorder}`,
            boxShadow: C.shadowMd,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {title}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={title}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "min(300px, calc(100vw - 48px))",
            padding: "14px 16px",
            borderRadius: 14,
            background: C.surface,
            border: `1px solid ${C.glassBorder}`,
            boxShadow: C.shadowMd,
          }}
        >
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: INFO_ICON_COLOR,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}>
            {title}
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: C.textSub, lineHeight: 1.55 }}>
                <span style={{ color: INFO_ICON_COLOR, flexShrink: 0, fontWeight: 700 }}>·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
