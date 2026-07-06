import { C, CHART, LOCALE } from "../../theme"
import { Card, SH, KpiCard, ExecutiveInsight } from "../UI"
import { DATA_TIERS } from "../../data/dashboardCopy"
import { useMeasuredData } from "../../context/DashboardDataContext"
import { deptColor, accentFill } from "../../data/processMapsMeta"

export default function DataQualityOverview({ onGoToFiles }) {
  const { KPIs, DEPT, DATA_QUALITY, usageRows } = useMeasuredData()
  const mappingPct = Math.round((DATA_QUALITY.provisioned_mapped_to_dept / DATA_QUALITY.provisioned_total) * 1000) / 10
  const sortedDept = [...DEPT].sort((a, b) => b.total - a.total)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ExecutiveInsight
        badge={DATA_TIERS.measured.label}
        badgeColor={DATA_TIERS.measured.color}
        see={`${mappingPct}% of provisioned users mapped to departments. ${DATA_QUALITY.unmapped_provisioned} unmapped.`}
        matter="All KPIs below are computed live from the two source files — not from a pre-generated bundle."
        action="Edit files in Source files to fix mapping gaps; the dashboard updates automatically."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <KpiCard label="Directory rows" value={KPIs.total_employees.toLocaleString(LOCALE)} color={CHART.primary} />
        <KpiCard label="Usage rows" value={(usageRows?.length ?? 0).toLocaleString(LOCALE)} color={CHART.secondary} />
        <KpiCard label="Mapped users" value={`${DATA_QUALITY.provisioned_mapped_to_dept}/${DATA_QUALITY.provisioned_total}`} sub="Provisioned with department" color={C.green} highlight />
        <div id="anomaly-unmapped-provisioned">
          <KpiCard label="Unmapped" value={DATA_QUALITY.unmapped_provisioned} sub={`${DATA_QUALITY.unmapped_not_in_directory} not in directory`} color={C.amber} highlight />
        </div>
        <KpiCard label="Unknown dept." value={DATA_QUALITY.excel_undefined_dept_rows} sub="In directory" color={C.muted} />
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <SH title="Department distribution" sub="From employee directory joined with usage export" />
          {onGoToFiles && (
            <button type="button" className="dq-link-btn" onClick={onGoToFiles}>Open source files →</button>
          )}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.glassBorder}` }}>
                {["Department", "In directory", "Provisioned", "Access rate"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: C.muted, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedDept.map((d) => {
                const col = deptColor(d.color)
                const fill = accentFill(d.color)
                return (
                  <tr key={d.d} style={{ borderBottom: `1px solid ${C.glassBorder}` }}>
                    <td style={{ padding: "11px 12px", fontWeight: 600, color: C.text }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: fill, marginRight: 8 }} />
                      {d.d}
                    </td>
                    <td style={{ padding: "11px 12px", color: C.textSub }}>{d.total.toLocaleString(LOCALE)}</td>
                    <td style={{ padding: "11px 12px", color: C.textSub }}>{d.provisioned}</td>
                    <td style={{ padding: "11px 12px", fontWeight: 600, color: col }}>{d.prov_rate}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
