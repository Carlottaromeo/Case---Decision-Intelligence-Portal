import { useEffect, useState } from "react"
import { APP_SECTIONS } from "../../data/navStructure"
import { NAV_ICONS } from "../NavIcons"
import { PRODUCT_NAME } from "../../data/dashboardCopy"
import AccountMenu from "./AccountMenu"

const STORAGE_KEY = "northstar-sidebar-expanded"
const OPEN_SECTIONS_KEY = "northstar-sidebar-open-sections"

function Chevron({ open, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={open ? "M6 9l6 6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CollapseIcon({ collapsed }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={collapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function AppSidebar({
  activeSection,
  activePage,
  onSectionChange,
  onPageChange,
  onLogout,
}) {
  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "false"
    } catch {
      return true
    }
  })

  const [openSections, setOpenSections] = useState(() => {
    try {
      const raw = localStorage.getItem(OPEN_SECTIONS_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      /* ignore */
    }
    return Object.fromEntries(APP_SECTIONS.map((s) => [s.id, false]))
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(expanded))
    } catch {
      /* ignore */
    }
  }, [expanded])

  useEffect(() => {
    try {
      localStorage.setItem(OPEN_SECTIONS_KEY, JSON.stringify(openSections))
    } catch {
      /* ignore */
    }
  }, [openSections])

  const handleSectionClick = (section) => {
    const hasMultiplePages = section.pages.length > 1

    if (!expanded) {
      setExpanded(true)
    }

    onSectionChange(section.id)

    if (hasMultiplePages) {
      setOpenSections((prev) => {
        const willOpen = !prev[section.id]
        if (willOpen) {
          const firstPage = section.pages[0]?.id
          if (firstPage) onPageChange(firstPage)
          const closed = Object.fromEntries(APP_SECTIONS.map((s) => [s.id, false]))
          return { ...closed, [section.id]: true }
        }
        return { ...prev, [section.id]: false }
      })
    } else {
      const firstPage = section.pages[0]?.id
      if (firstPage) onPageChange(firstPage)
      setOpenSections((prev) => ({ ...prev, [section.id]: false }))
    }
  }

  return (
    <aside
      className={`app-sidebar${expanded ? " app-sidebar--expanded" : ""}`}
      aria-label="Main navigation"
    >
      <div className="app-sidebar__header">
        <button
          type="button"
          className="app-sidebar__toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Comprimi menu" : "Espandi menu"}
        >
          <CollapseIcon collapsed={!expanded} />
        </button>
        <div className="app-sidebar__logo" title={PRODUCT_NAME}>
          <span>NS</span>
        </div>
        {expanded && (
          <div className="app-sidebar__brand">
            <span className="app-sidebar__brand-name">{PRODUCT_NAME}</span>
          </div>
        )}
      </div>

      <nav className="app-sidebar__nav">
        {APP_SECTIONS.map((section) => {
          const Icon = NAV_ICONS[section.iconKey]
          const sectionActive = activeSection === section.id
          const isOpen = openSections[section.id]
          const hasMultiplePages = section.pages.length > 1

          return (
            <div key={section.id} className="app-sidebar__group">
              <button
                type="button"
                className={`app-sidebar__section${sectionActive ? " app-sidebar__section--active" : ""}${isOpen ? " app-sidebar__section--open" : ""}`}
                onClick={() => handleSectionClick(section)}
                title={section.label}
                aria-expanded={hasMultiplePages ? isOpen : undefined}
              >
                <span className="app-sidebar__section-icon" aria-hidden="true">
                  <Icon size={20} color={sectionActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)"} />
                </span>
                {expanded && (
                  <>
                    <span className="app-sidebar__section-label">{section.label}</span>
                    {hasMultiplePages && (
                      <span className="app-sidebar__section-chevron" aria-hidden="true">
                        <Chevron open={isOpen} />
                      </span>
                    )}
                  </>
                )}
              </button>

              {expanded && hasMultiplePages && isOpen && (
                <div className="app-sidebar__pages">
                  {section.pages.map((page) => {
                    const pageActive = sectionActive && activePage === page.id
                    return (
                      <button
                        key={page.id}
                        type="button"
                        className={`app-sidebar__page${pageActive ? " app-sidebar__page--active" : ""}`}
                        onClick={() => {
                          onSectionChange(section.id)
                          onPageChange(page.id)
                        }}
                        aria-current={pageActive ? "page" : undefined}
                      >
                        {page.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {onLogout && (
        <div className="app-sidebar__footer">
          <AccountMenu placement="sidebar" expanded={expanded} />
          <button
            type="button"
            className="app-sidebar__logout"
            onClick={onLogout}
            title="Esci"
          >
            <span className="app-sidebar__logout-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {expanded && <span>Esci</span>}
          </button>
        </div>
      )}

    </aside>
  )
}
