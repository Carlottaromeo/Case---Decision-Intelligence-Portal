import { C } from "../../theme"
import { DATA_TIERS } from "../../data/dashboardCopy"
import {
  ADOPTION_LEVELS,
  DATA_TIER_FILTER_OPTIONS,
  INVESTMENT_PRIORITIES,
  isFutureReadyFilter,
} from "../../data/processFilters"

function FilterIcon() {
  return (
    <span className="filter-bar__icon" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 6h16M7 12h10M10 18h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

function FilterField({ label, children, disabled }) {
  return (
    <label className={`filter-field${disabled ? " filter-field--disabled" : ""}`}>
      <span className="filter-field__label">{label}</span>
      {children}
    </label>
  )
}

function FilterSelect({ value, onChange, disabled, children }) {
  const isActive = Boolean(value)
  return (
    <div className="filter-select-wrap">
      <select
        className={`filter-select${isActive ? " filter-select--active" : ""}`}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
      >
        {children}
      </select>
    </div>
  )
}

function countActiveFilters(filters, showFull, showDataTier) {
  let n = 0
  if (showDataTier && filters.dataTier) n++
  if (filters.department) n++
  if (filters.adoptionLevel) n++
  if (filters.investmentPriority) n++
  if (showFull) {
    if (filters.seniority) n++
    if (filters.dateFrom || filters.dateTo) n++
  }
  return n
}

/**
 * Shared process-section filters.
 * @param {"full"|"compact"} [props.variant] — compact hides date range and seniority
 * @param {boolean} [props.showDataTier] — hide Measured/Simulated/Future-ready dropdown
 */
export default function ProcessFilters({
  filters,
  onChange,
  processWeeks,
  departments,
  seniorities,
  variant = "full",
  showDataTier = true,
}) {
  const futureReady = showDataTier && isFutureReadyFilter(filters)
  const measuredOnly = showDataTier && filters.dataTier === DATA_TIERS.measured.label
  const showFull = variant === "full"
  const activeCount = countActiveFilters(filters, showFull, showDataTier)

  function set(key, value) {
    onChange({ ...filters, [key]: value === "" ? null : value })
  }

  function clearAll() {
    onChange({
      ...filters,
      dataTier: null,
      department: null,
      seniority: null,
      adoptionLevel: null,
      investmentPriority: null,
    })
  }

  return (
    <div className="glass-panel filter-bar">
      <div className="filter-bar__header">
        <div className="filter-bar__title">
          <FilterIcon />
          <span>Filters</span>
          {activeCount > 0 && (
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 999,
              background: C.accentDim,
              color: C.accent,
              border: `1px solid ${C.accent}44`,
            }}>
              {activeCount} active
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: `1px solid ${C.glassBorder}`,
              background: C.surface2,
              color: C.muted,
              fontSize: 11,
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.glassBorderL
              e.currentTarget.style.color = C.text
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.glassBorder
              e.currentTarget.style.color = C.muted
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {futureReady && (
        <p className="filter-bar__hint">Future-ready data not available in this MVP.</p>
      )}

      <div className="filter-bar__grid">
        {showDataTier && (
          <FilterField label="Data type">
            <FilterSelect value={filters.dataTier} onChange={(e) => set("dataTier", e.target.value)}>
              <option value="">All types</option>
              {DATA_TIER_FILTER_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </FilterSelect>
          </FilterField>
        )}

        {showFull && (
          <>
            <FilterField label="Date from" disabled={futureReady}>
              <FilterSelect
                value={filters.dateFrom}
                onChange={(e) => set("dateFrom", e.target.value)}
                disabled={futureReady}
              >
                {processWeeks.map((w) => (
                  <option key={w.week_start} value={w.week_start}>{w.label}</option>
                ))}
              </FilterSelect>
            </FilterField>
            <FilterField label="Date to" disabled={futureReady}>
              <FilterSelect
                value={filters.dateTo}
                onChange={(e) => set("dateTo", e.target.value)}
                disabled={futureReady}
              >
                {processWeeks.map((w) => (
                  <option key={w.week_start} value={w.week_start}>{w.label}</option>
                ))}
              </FilterSelect>
            </FilterField>
            <FilterField label="Seniority" disabled={futureReady}>
              <FilterSelect
                value={filters.seniority}
                onChange={(e) => set("seniority", e.target.value)}
                disabled={futureReady}
              >
                <option value="">All levels</option>
                {seniorities.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </FilterSelect>
            </FilterField>
          </>
        )}

        <FilterField label="Department" disabled={futureReady}>
          <FilterSelect
            value={filters.department}
            onChange={(e) => set("department", e.target.value)}
            disabled={futureReady}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField label="Adoption level" disabled={futureReady}>
          <FilterSelect
            value={filters.adoptionLevel}
            onChange={(e) => set("adoptionLevel", e.target.value)}
            disabled={futureReady}
          >
            <option value="">All levels</option>
            {ADOPTION_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField label="Investment priority" disabled={futureReady || measuredOnly}>
          <FilterSelect
            value={filters.investmentPriority}
            onChange={(e) => set("investmentPriority", e.target.value)}
            disabled={futureReady || measuredOnly}
          >
            <option value="">All priorities</option>
            {INVESTMENT_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </FilterSelect>
        </FilterField>
      </div>
    </div>
  )
}
