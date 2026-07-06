import { QUADRANTS } from "../../data/investmentPlanner"
import { ACTION_COLORS, deptColor } from "../../data/processMapsMeta"

const Y_TICKS = [
  { label: "High", pct: 84 },
  { label: "Medium", pct: 50 },
  { label: "Low", pct: 16 },
]

const X_TICKS = [0, 25, 50, 75, 100]

function deptShort(name) {
  const shortcuts = {
    "Customer Support": "Support",
    "Sales & Part.": "Sales",
    "Data & Analytics": "Data",
    "Risk & Compliance": "Risk",
  }
  return shortcuts[name] ?? name.split(/\s+/)[0]
}

export default function InvestmentScatter({ items, selectedId, onSelect }) {
  return (
    <div className="investment-scatter">
      <div className="investment-scatter__frame">
        <div className="investment-scatter__y-axis" aria-hidden="true">
          {Y_TICKS.map((tick) => (
            <span key={tick.label} style={{ bottom: `${tick.pct}%` }}>
              {tick.label}
            </span>
          ))}
        </div>

        <div className="investment-scatter__plot" role="img" aria-label="Investment priority scatter plot by department">
          {QUADRANTS.map((q) => (
            <div
              key={q.id}
              className="investment-scatter__quadrant"
              style={{
                left: `${q.x1}%`,
                width: `${q.x2 - q.x1}%`,
                bottom: `${q.y1}%`,
                height: `${q.y2 - q.y1}%`,
                background: `#${q.color}14`,
                borderColor: `#${q.color}28`,
              }}
            >
              <span className="investment-scatter__quadrant-label" style={{ color: `#${q.color}` }}>
                {q.label}
              </span>
            </div>
          ))}

          {items.map((item) => {
            const col = deptColor(item.color)
            const isSelected = selectedId === item.id
            const priorityColor = ACTION_COLORS[item.investment_priority] ?? col
            return (
              <button
                key={item.id}
                type="button"
                className={`investment-scatter__point${isSelected ? " investment-scatter__point--selected" : ""}`}
                style={{
                  left: `${item.plotX}%`,
                  bottom: `${item.plotY}%`,
                  background: col,
                  boxShadow: isSelected ? `0 0 0 3px ${priorityColor}55, 0 4px 12px rgba(31,31,31,0.15)` : undefined,
                }}
                onClick={() => onSelect?.(item)}
                title={`${item.department} · ${item.investment_priority} · ${item.adoption_rate}% adoption`}
              >
                <span className="investment-scatter__point-label">{deptShort(item.department)}</span>
                {item.live_workflow_boost > 0 && (
                  <span className="investment-scatter__live" title="Live workflow">●</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="investment-scatter__x-axis" aria-hidden="true">
        {X_TICKS.map((tick) => (
          <span key={tick} style={{ left: `${tick}%` }}>
            {tick}%
          </span>
        ))}
        <span className="investment-scatter__x-title">Adoption rate</span>
      </div>

      <div className="investment-scatter__legend">
        {Object.entries(ACTION_COLORS).map(([action, color]) => (
          <span key={action} className="investment-scatter__legend-item">
            <span className="investment-scatter__legend-dot" style={{ background: color }} />
            {action}
          </span>
        ))}
        <span className="investment-scatter__legend-note">Dot color = department · ring = priority when selected</span>
      </div>
    </div>
  )
}
