import { CHART, LOCALE, DEPT_COLOR } from "../../theme"
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
  const topTool = deptRow
    ? [
        ["Chat", deptRow.chat],
        ["Excel", deptRow.excel],
        ["Coding IDE", deptRow.coding],
      ].sort((a, b) => b[1] - a[1])[0]
    : null

  return (
    <div className="process-guided">
      {deptRow && (
        <section className="process-bu-kpi-header">
          <KpiPill label="Adoption %" value={`${deptRow.prov_rate}%`} highlight={col} />
          <KpiPill label="Active users" value={`${deptRow.active_users}/${deptRow.total}`} />
          <KpiPill label="Credits (13w)" value={deptRow.total_credits.toLocaleString(LOCALE)} />
          <KpiPill label="Cr/week avg" value={String(deptRow.cr_week)} />
        </section>
      )}

      {deptRow && (
        <section className="process-panel process-panel--compact">
          <div className="process-panel__head">
            <IconChart size={16} color={col} />
            <span>Department metrics</span>
          </div>
          <div className="process-kpi-grid">
            <KpiPill label="Outside rollout" value={deptRow.gap.toLocaleString(LOCALE)} />
            <KpiPill label="Sessions" value={deptRow.total_sessions.toLocaleString(LOCALE)} />
            <KpiPill label="Cr/user (13w)" value={deptRow.cr_user.toLocaleString(LOCALE)} />
          </div>
          {topTool && (
            <div className="process-tool-mix__top-badge">
              Top tool: {topTool[0]} ({topTool[1]}%)
            </div>
          )}
          <div className="process-tool-mix">
            {[
              ["Chat", deptRow.chat, CHART.tools.Chat, CHART.toolFills.Chat],
              ["Excel", deptRow.excel, CHART.tools.Excel, CHART.toolFills.Excel],
              ["Coding IDE", deptRow.coding, CHART.tools["Coding IDE"], CHART.toolFills["Coding IDE"]],
            ].map(([label, val, labelColor, barColor]) => (
              <div key={label} className="process-tool-mix__row">
                <span style={{ color: labelColor }}>{label}</span>
                <MiniBar value={val} color={barColor} height={6} />
                <strong style={{ color: labelColor }}>{val}%</strong>
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
                    {u.credits.toLocaleString(LOCALE)} credits · {u.sessions} sessions
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
          <button type="button" className="process-workflow-add-btn" disabled>
            Add new workflow
          </button>
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
              <div className="process-workflow-card__right">
                <span className={`process-workflow-card__status${wf.clickable ? " process-workflow-card__status--live" : ""}`}>
                  {wf.clickable ? "Live" : "Soon"}
                </span>
                {wf.clickable ? (
                  <span className="process-workflow-card__cta">Open</span>
                ) : (
                  <span className="process-workflow-card__soon">Planned</span>
                )}
              </div>
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
