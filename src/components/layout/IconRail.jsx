import { useEffect, useState } from "react"
import { C } from "../../theme"
import { APP_SECTIONS } from "../../data/navStructure"
import { NAV_ICONS } from "../NavIcons"
import { PRODUCT_NAME } from "../../data/dashboardCopy"

const STORAGE_KEY = "northstar-nav-expanded"

function Chevron({ open }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={open ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function IconRail({ activeSection, onSectionChange }) {
  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true"
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(expanded))
    } catch {
      /* ignore */
    }
  }, [expanded])

  return (
    <aside
      className={`icon-rail${expanded ? " icon-rail--expanded" : ""}`}
      aria-label="Main navigation"
    >
      <div className="icon-rail__header">
        <div className="icon-rail__logo" title={PRODUCT_NAME}>
          <span>NS</span>
        </div>
        {expanded && (
          <div className="icon-rail__brand">
            <span className="icon-rail__brand-name">{PRODUCT_NAME}</span>
          </div>
        )}
      </div>

      <nav className="icon-rail__nav">
        {APP_SECTIONS.map((section) => {
          const Icon = NAV_ICONS[section.iconKey]
          const active = activeSection === section.id
          return (
            <button
              key={section.id}
              type="button"
              className={`icon-rail__btn${active ? " icon-rail__btn--active" : ""}`}
              onClick={() => onSectionChange(section.id)}
              title={section.label}
              aria-label={section.label}
              aria-current={active ? "page" : undefined}
            >
              <span className="icon-rail__btn-icon" aria-hidden="true">
                <Icon size={22} color={active ? C.accent : "rgba(255,255,255,0.55)"} />
              </span>
              {expanded && (
                <span className="icon-rail__btn-label">{section.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        className="icon-rail__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
        title={expanded ? "Collapse menu" : "Expand menu"}
      >
        <Chevron open={expanded} />
        {expanded && <span>Collapse</span>}
      </button>
    </aside>
  )
}
