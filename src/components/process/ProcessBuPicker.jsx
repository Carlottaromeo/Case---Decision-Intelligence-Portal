import { LOCALE, DEPT_COLOR } from "../../theme"
import { DATA_TIERS } from "../../data/dashboardCopy"
import { Badge } from "../UI"
import { getBusinessDepartments } from "../../utils/deptUsageStats"
import { IconBuilding, IconUsers } from "./ProcessIcons"

function deptAccent(d) {
  const raw = DEPT_COLOR[d.d] ?? d.color
  return raw?.startsWith("#") ? raw : `#${raw}`
}

export default function ProcessBuPicker({ departments, onSelect }) {
  const list = getBusinessDepartments(departments)

  return (
    <div className="process-guided">
      <div className="process-guided__badge-row">
        <Badge label={DATA_TIERS.simulated.label} color={DATA_TIERS.simulated.color} />
      </div>

      <div className="process-bu-grid">
        {list.map((d) => {
          const col = deptAccent(d)
          return (
            <button
              key={d.d}
              type="button"
              className="process-bu-card"
              onClick={() => onSelect(d.d)}
            >
              <div className="process-bu-card__icon" style={{ color: col }}>
                <IconBuilding size={20} color={col} />
              </div>
              <div className="process-bu-card__name">{d.d}</div>
              <div className="process-bu-card__chips">
                <span className="process-chip">
                  <IconUsers size={13} color="#9ca3af" />
                  {d.total.toLocaleString(LOCALE)}
                </span>
                <span className="process-chip">{d.prov_rate}% access</span>
                <span className="process-chip">{d.provisioned} prov.</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
