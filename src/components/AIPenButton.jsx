import { useState } from "react"
import { C } from "../theme"
import { IconSparkle } from "./InsightIcons"
import { insightBtnStyle, INSIGHT_ICON_COLOR } from "./cardActions"

const DEFAULT_TOOLTIP = "Analysis and interpretation"

export default function AIPenButton({ onClick, title = DEFAULT_TOOLTIP }) {
  const [hover, setHover] = useState(false)
  const active = hover

  return (
    <div
      style={{ position: "relative", flexShrink: 0 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={title}
        style={insightBtnStyle(active)}
      >
        <IconSparkle size={19} color={active ? C.indigoDk : INSIGHT_ICON_COLOR} />
      </button>

      {hover && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
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
    </div>
  )
}
