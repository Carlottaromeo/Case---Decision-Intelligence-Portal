import { CHART, LOCALE, DEPT_COLOR } from "../../theme"
import { DATA_TIERS } from "../../data/dashboardCopy"
import { Badge, MiniBar } from "../UI"
import { getWorkflowsForDepartment } from "../../data/workflowCatalog"
import { getTopUsersByDepartment } from "../../utils/deptUsageStats"
import { IconChart, IconUsers, IconWorkflow } from "./ProcessIcons"

function deptAccent(name, deptRow) {
  const raw = DEPT_COLOR[name] ?? deptRow?.color
  if (!raw) return "#6229FF"
  return raw.startsWith("#") ? raw : `#${raw}`
}

export default function ProcessBuDetail({
  department,
  deptRow,
  usageRecords,
  employeeRoster,
  onOpenWorkflow,
}) {
  const workflows = getWorkflowsForDepartment(department)
  const topUsers = getTopUsersByDepartment(usageRecords, department, deptRow, 3, employeeRoster)
  const col = deptAccent(department, deptRow)

  return (
    <div className="process-guided">
      <div className="process-guided__badge-row">
        <Badge label={DATA_TIERS.measured.label} color={DATA_TIERS.measured.color} />
      </div>

      {deptRow && (
        <section className="process-panel">
          <div className="process-panel__head">
            <IconChart size={16} color={col} />
            <span>Department metrics</span>
          </div>
          <div className="process-kpi-grid">
            <KpiPill label="Access rate" value={`${deptRow.prov_rate}%`} highlight={col} />
            <KpiPill label="Active users" value={`${deptRow.active_users}/${deptRow.total}`} />
            <KpiPill label="Credits" value={deptRow.total_credits.toLocaleString(LOCALE)} />
            <KpiPill label="Sessions" value={deptRow.total_sessions.toLocaleString(LOCALE)} />
            <KpiPill label="Cr / week" value={String(deptRow.cr_week)} />
          </div>
          <div className="process-tool-mix">
            {[
              ["Chat", deptRow.chat, CHART.tools.Chat],
              ["Excel", deptRow.excel, CHART.tools.Excel],
              ["Coding IDE", deptRow.coding, CHART.tools["Coding IDE"]],
            ].map(([label, val, color]) => (
              <div key={label} className="process-tool-mix__row">
                <span>{label}</span>
                <MiniBar value={val} color={color} height={5} />
                <strong>{val}%</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="process-panel">
        <div className="process-panel__head">
          <IconUsers size={16} color="#6229FF" />
          <span>Top AI users</span>
        </div>
        {topUsers.length === 0 ? (
          <p className="process-empty">No usage recorded for this department.</p>
        ) : (
          <div className="process-user-cards">
            {topUsers.map((u) => (
              <div key={u.employee_id} className="process-user-card">
                <div className="process-user-card__rank">#{u.rank}</div>
                <div className="process-user-card__body">
                  <div className="process-user-card__name">{u.display_name}</div>
                  <div className="process-user-card__meta">
                    {u.credits.toLocaleString(LOCALE)} cr · {u.sessions} sessions
                  </div>
                </div>
                <span className="process-user-card__tool">{u.primary_tool}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="process-panel">
        <div className="process-panel__head process-panel__head--split">
          <div className="process-panel__head">
            <IconWorkflow size={16} color="#6229FF" />
            <span>Workflows</span>
          </div>
          <Badge label={DATA_TIERS.simulated.label} color={DATA_TIERS.simulated.color} />
        </div>
        <div className="process-workflow-list">
          {workflows.map((wf) => (
            <button
              key={wf.id}
              type="button"
              className={`process-workflow-card${wf.clickable ? " process-workflow-card--live" : " process-workflow-card--disabled"}`}
              disabled={!wf.clickable}
              title={wf.clickable ? "Open workflow diagram" : "Prototype — coming soon"}
              onClick={() => wf.clickable && onOpenWorkflow(wf.id)}
            >
              <div className="process-workflow-card__content">
                <div className="process-workflow-card__title">{wf.title}</div>
                <div className="process-workflow-card__desc">{wf.description}</div>
              </div>
              {wf.clickable ? (
                <span className="process-workflow-card__cta">Open →</span>
              ) : (
                <span className="process-workflow-card__soon">Soon</span>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function KpiPill({ label, value, highlight }) {
  return (
    <div className={`process-kpi-pill${highlight ? " process-kpi-pill--highlight" : ""}`}>
      <div className="process-kpi-pill__label">{label}</div>
      <div className="process-kpi-pill__value">{value}</div>
    </div>
  )
}
