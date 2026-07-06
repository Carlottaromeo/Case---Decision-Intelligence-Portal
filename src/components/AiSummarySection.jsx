import { useState } from "react"
import { AI_SUMMARY } from "../data/dashboardCopy"
import { Badge } from "./UI"
import { IconSparkle } from "./InsightIcons"
import { ACTION_ICON_SIZE } from "./cardActions"

function AiSummaryIcon() {
  return (
    <span className="ai-summary-section__icon" aria-hidden="true">
      <IconSparkle size={ACTION_ICON_SIZE} color="#4f46e5" />
    </span>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`ai-summary-section__chevron${open ? " ai-summary-section__chevron--open" : ""}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AiSummarySection({
  title = AI_SUMMARY.label,
  defaultOpen = false,
  badge,
  badgeColor,
  className = "",
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={`ai-summary-section glass-panel${className ? ` ${className}` : ""}`}>
      <button
        type="button"
        className="ai-summary-section__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="ai-summary-section__leading">
          <AiSummaryIcon />
          <span className="ai-summary-section__title">{title}</span>
        </span>
        <span className="ai-summary-section__trailing">
          {badge && <Badge label={badge} color={badgeColor} />}
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && <div className="ai-summary-section__body">{children}</div>}
    </section>
  )
}

export { AiSummaryIcon }
