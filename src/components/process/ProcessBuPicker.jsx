import { LOCALE, DEPT_COLOR, ACID } from "../../theme"
import { getBusinessDepartments } from "../../utils/deptUsageStats"
import { IconUsers } from "./ProcessIcons"
import BusinessUnitIllustration from "./BusinessUnitIllustration"

function deptAccent(d) {
  const raw = DEPT_COLOR[d.d] ?? d.color
  return raw?.startsWith("#") ? raw : `#${raw}`
}

function getDominantTool(d) {
  const mix = [
    ["Chat", d.chat],
    ["Excel", d.excel],
    ["Coding", d.coding],
  ]
  mix.sort((a, b) => b[1] - a[1])
  return { label: mix[0][0], pct: mix[0][1] }
}

function topToolColor(pct) {
  if (pct < 35) return ACID.red
  if (pct <= 65) return ACID.yellow
  return ACID.green
}

export default function ProcessBuPicker({ departments, onSelect }) {
  const list = getBusinessDepartments(departments)

  return (
    <div className="process-guided">
      <div className="process-bu-grid">
        {list.map((d) => {
          const col = deptAccent(d)
          const topTool = getDominantTool(d)
          return (
            <button
              key={d.d}
              type="button"
              className="process-bu-card"
              onClick={() => onSelect(d.d)}
            >
              <div className="process-bu-card__media">
                <BusinessUnitIllustration department={d.d} accentColor={col} variant="hero" />
              </div>
              <div className="process-bu-card__body">
                <div className="process-bu-card__name">{d.d}</div>
                <div className="process-bu-card__chips">
                  <span className="process-chip">
                    <IconUsers size={13} color="#9ca3af" />
                    {d.total.toLocaleString(LOCALE)}
                  </span>
                  <span className="process-chip">{d.prov_rate}% access</span>
                  <span className="process-chip">{d.provisioned} prov.</span>
                </div>
                <div className="process-bu-card__stats">
                  <div className="process-bu-card__stat">
                    <span className="process-bu-card__stat-label">Active users</span>
                    <strong>{d.active_users}/{d.total}</strong>
                  </div>
                  <div className="process-bu-card__stat">
                    <span className="process-bu-card__stat-label">Without access</span>
                    <strong>{d.gap}</strong>
                  </div>
                  <div className="process-bu-card__stat">
                    <span className="process-bu-card__stat-label">Credits</span>
                    <strong>{d.total_credits.toLocaleString(LOCALE)}</strong>
                  </div>
                  <div className="process-bu-card__stat">
                    <span className="process-bu-card__stat-label">Sessions</span>
                    <strong>{d.total_sessions.toLocaleString(LOCALE)}</strong>
                  </div>
                  <div className="process-bu-card__stat">
                    <span className="process-bu-card__stat-label">Cr / user</span>
                    <strong>{d.cr_user.toLocaleString(LOCALE)}</strong>
                  </div>
                  <div className="process-bu-card__stat">
                    <span className="process-bu-card__stat-label">Top tool</span>
                    <strong style={{ color: topToolColor(topTool.pct) }}>
                      {topTool.label} {topTool.pct}%
                    </strong>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
