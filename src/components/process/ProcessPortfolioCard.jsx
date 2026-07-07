import { LOCALE, ACID } from "../../theme"
import { Badge } from "../UI"

function adoptionColor(rate) {
  if (rate < 20) return ACID.red
  if (rate > 43) return ACID.green
  return ACID.yellow
}

function buildBuSummary(item) {
  const department = String(item.department ?? "").toLowerCase()
  const adoption = item.adoption_rate?.toLocaleString(LOCALE) ?? "0"
  const active = item.processMapRef?.active_users
  const total = item.processMapRef?.total_employees
  const activeSlice = (active != null && total != null)
    ? `${active.toLocaleString(LOCALE)}/${total.toLocaleString(LOCALE)} active`
    : `${adoption}% adoption`

  if (department.includes("data")) {
    return `Strong daily usage in analytics workflows, with ${activeSlice} in the current period.`
  }
  if (department.includes("technology")) {
    return `Stable engineering usage across development activities, with ${activeSlice} in the current period.`
  }
  if (department.includes("risk") || department.includes("compliance")) {
    return `Adoption is concentrated on review and control tasks, with ${activeSlice} in the current period.`
  }
  if (department.includes("customer support")) {
    return `Usage is regular in request handling operations, with ${activeSlice} in the current period.`
  }
  if (department.includes("pricing")) {
    return `Good traction on pricing analysis scenarios, with ${activeSlice} in the current period.`
  }
  if (department.includes("finance")) {
    return `Monthly reporting activities show consistent usage, with ${activeSlice} in the current period.`
  }
  if (department.includes("people")) {
    return `Adoption is building in onboarding and support routines, with ${activeSlice} in the current period.`
  }
  if (department.includes("sales")) {
    return `Field and proposal workflows show uneven adoption, with ${activeSlice} in the current period.`
  }
  if (department.includes("underwriting")) {
    return `Early but measurable use in underwriting assessments, with ${activeSlice} in the current period.`
  }
  return `Current department usage is ${activeSlice} in the observed period.`
}

function DepartmentIcon({ department }) {
  const d = String(department ?? "").toLowerCase()

  if (d.includes("technology") || d.includes("data")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M18 9h3M3 15h3M18 15h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (d.includes("finance") || d.includes("pricing")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 8h12M6 12h12M6 16h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }
  if (d.includes("people") || d.includes("support")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.5 18c.9-2.4 2.8-3.6 5.4-3.6s4.5 1.2 5.4 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
  if (d.includes("risk") || d.includes("compliance") || d.includes("underwriting")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4l7 3v5c0 4.1-2.6 6.9-7 8-4.4-1.1-7-3.9-7-8V7l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9.5 12.5l1.8 1.8 3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (d.includes("sales") || d.includes("part")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 16l5-5 4 4 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 8h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 5V3h6v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function ProcessPortfolioCard({
  item,
  featured = false,
  showRank = false,
  showCoachDetail = false,
  onCoachDetail,
  onViewWorkflows,
}) {
  const snippet = buildBuSummary(item)
  const headcount = item.processMapRef?.total_employees
  const keyMetrics = [
    { label: "Adoption", value: `${item.adoption_rate.toLocaleString(LOCALE)}%` },
    { label: "AI potential", value: item.ai_potential ?? "—" },
    { label: "Priority", value: item.investment_priority ?? "—" },
    { label: "Headcount", value: headcount != null ? headcount.toLocaleString(LOCALE) : "—" },
  ]

  return (
    <button
      type="button"
      className={`investment-hero__card investment-hero__card--clickable${featured ? " investment-hero__card--lead" : ""}`}
      onClick={() => onViewWorkflows?.(item)}
      aria-label={`Open process mapping for ${item.department}: ${item.process_name}`}
    >
      {showRank && item.rank != null && (
        <div className="investment-hero__rank">#{item.rank}</div>
      )}
      <div className="investment-hero__dept">
        <span className="investment-hero__icon" aria-hidden="true">
          <DepartmentIcon department={item.department} />
        </span>
        {item.department}
      </div>
      <div className="investment-hero__badges">
        <Badge
          label={`${item.adoption_rate.toLocaleString(LOCALE)}% adoption`}
          color={adoptionColor(item.adoption_rate)}
          icon="star"
        />
      </div>
      <div className="investment-hero__summary">
        <div className="investment-hero__summary-label">BU summary</div>
        <div className="investment-hero__snippet">{snippet}</div>
      </div>

      <div className="investment-hero__metrics" aria-label="Key BU metrics">
        {keyMetrics.map((metric) => (
          <div key={metric.label} className="investment-hero__metric">
            <span className="investment-hero__metric-label">{metric.label}</span>
            <strong className="investment-hero__metric-value">{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className="investment-hero__actions">
        {showCoachDetail && (
          <button
            type="button"
            className="investment-btn investment-btn--ghost"
            onClick={(e) => {
              e.stopPropagation()
              onCoachDetail?.(item)
            }}
          >
            Coach detail
          </button>
        )}
      </div>
    </button>
  )
}
