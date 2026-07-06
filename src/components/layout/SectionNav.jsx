import { LAYOUT } from "../../theme"
import { getSection } from "../../data/navStructure"
export default function SectionNav({ sectionId, activePage, onPageChange }) {
  const section = getSection(sectionId)
  if (!section) return null

  return (
    <aside
      className="section-nav"
      style={{ width: LAYOUT.sectionNavWidth }}
      aria-label={`${section.label} pages`}
    >
      <div className="section-nav__header">
        <h2 className="section-nav__title">{section.label}</h2>
        <p className="section-nav__question">{section.question}</p>
      </div>

      <nav className="section-nav__list">
        <div className="section-nav__group-label">Views</div>
        {section.pages.map((page) => {
          const active = activePage === page.id
          return (
            <button
              key={page.id}
              type="button"
              className={`section-nav__item${active ? " section-nav__item--active" : ""}`}
              onClick={() => onPageChange(page.id)}
              aria-current={active ? "page" : undefined}
            >
              <span className="section-nav__item-dot" aria-hidden="true" />
              {page.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
