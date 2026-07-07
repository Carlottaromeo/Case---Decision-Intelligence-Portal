import { C } from "../../theme"

export default function Breadcrumbs({ items, onNavigate }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.id} className="breadcrumbs__segment">
          {i > 0 && <span className="breadcrumbs__sep" aria-hidden="true">›</span>}
          {item.current || !item.onClick ? (
            <span
              className={`breadcrumbs__item${item.current ? " breadcrumbs__item--current" : ""}`}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </span>
          ) : (
            <button
              type="button"
              className="breadcrumbs__link"
              onClick={() => onNavigate?.(item)}
            >
              {item.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  )
}

export function PageHeader({ breadcrumbs, title, subtitle, stats, actions, onBreadcrumbNavigate }) {
  return (
    <header className="page-header">
      <Breadcrumbs items={breadcrumbs} onNavigate={onBreadcrumbNavigate} />
      <div className="page-header__row">
        <div className="page-header__text">
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        <div className="page-header__aside">
          {stats?.length > 0 && (
            <div className="page-header__stats">
              {stats.map((s) => (
                <div key={s.label} className="page-header__stat glass-panel">
                  <div className="page-header__stat-label">{s.label}</div>
                  <div className="page-header__stat-value" style={{ color: s.color ?? C.text }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}
          {actions && <div className="page-header__actions">{actions}</div>}
        </div>
      </div>
    </header>
  )
}
