import { C } from "../../theme"
import { deptColor, ACTION_COLORS } from "../../data/processMapsMeta"

const LANES = [
  { action: "Activate", color: ACTION_COLORS.Activate },
  { action: "Quick win", color: ACTION_COLORS["Quick win"] },
  { action: "Industrialize", color: ACTION_COLORS.Industrialize },
  { action: "Scale", color: ACTION_COLORS.Scale },
  { action: "Monitor", color: ACTION_COLORS.Monitor },
]

export default function InvestmentLanes({ items, selectedId, onSelect }) {
  const byLane = Object.fromEntries(LANES.map((l) => [l.action, []]))
  for (const item of items) {
    const lane = item.investment_priority
    if (byLane[lane]) byLane[lane].push(item)
  }

  return (
    <div className="investment-lanes">
      <div className="investment-lanes__grid">
        {LANES.map((lane) => (
          <div key={lane.action} className="investment-lane">
            <div
              className="investment-lane__header"
              style={{ borderColor: `${lane.color}55`, background: `${lane.color}12` }}
            >
              <span style={{ color: lane.color, fontWeight: 800 }}>{lane.action}</span>
              <span className="investment-lane__count">{byLane[lane.action].length}</span>
            </div>
            <div className="investment-lane__body">
              {byLane[lane.action].length === 0 ? (
                <span className="investment-lane__empty">—</span>
              ) : (
                byLane[lane.action].map((item) => {
                  const col = deptColor(item.color)
                  const isSelected = selectedId === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`investment-lane__chip${isSelected ? " investment-lane__chip--selected" : ""}`}
                      style={{ borderColor: isSelected ? col : C.glassBorder }}
                      onClick={() => onSelect?.(item)}
                    >
                      <span className="investment-lane__dot" style={{ background: col }} />
                      <span className="investment-lane__label">{item.department}</span>
                      <span className="investment-lane__meta">{item.adoption_rate}%</span>
                      {item.live_workflow_boost > 0 && (
                        <span className="investment-lane__live" title="Live workflow with opportunities">●</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
