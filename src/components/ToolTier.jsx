import { useMeasuredData } from "../context/DashboardDataContext"
import { C, CHART, LOCALE, accentFill } from "../theme"
import { Card, SH, MiniBar, ExecutiveInsight, KpiCard } from "./UI"
import CardActionBar from "./CardActionBar"
import { ACTION_BAR_OFFSET } from "./cardActions"
import { DATA_TIERS } from "../data/dashboardCopy"
import { deptColor } from "../data/processMapsMeta"

function getProfile(d) {
  if (d.coding > 30) return { label: "Dev / Technical", color: CHART.tools["Coding IDE"] }
  if (d.excel > 40)  return { label: "Analytical", color: CHART.tools.Excel }
  if (d.chat > 80)   return { label: "Conversational", color: CHART.tools.Chat }
  return { label: "Mixed", color: C.accent }
}

export default function ToolTier({ onOpenInsights, view = "reliability" }) {
  const { DEPT, TOOL_DATA, LLM_DATA, KPIs, DATA_QUALITY } = useMeasuredData()
  const toolTotal = TOOL_DATA.reduce((s, d) => s + d.credits, 0)
  const llmTotal  = LLM_DATA.reduce((s, d) => s + d.credits, 0)
  const mappingPct = Math.round((DATA_QUALITY.provisioned_mapped_to_dept / DATA_QUALITY.provisioned_total) * 100)

  if (view === "patterns") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          <Card>
            <SH title="Credits by tool" />
            {TOOL_DATA.map(d => {
              const col = CHART.tools[d.tool] || deptColor(d.color)
              const fill = CHART.toolFills[d.tool] || accentFill(d.color)
              return (
                <div key={d.tool} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: C.textSub, fontWeight: 600 }}>{d.tool}</span>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: col }}>{(d.credits / toolTotal * 100).toFixed(0)}%</span>
                      <span style={{ fontSize: 12, color: C.subtle }}>{d.credits.toLocaleString(LOCALE)}</span>
                    </div>
                  </div>
                  <MiniBar value={d.credits / toolTotal * 100} color={fill} height={10} />
                </div>
              )
            })}
          </Card>
          <Card>
            <CardActionBar info={{ title: "Tier labels", items: ["Instant, Thinking, Pro — complexity tiers."] }} />
            <SH title="Credits by LLM tier" />
            {LLM_DATA.map(d => {
              const col = CHART.tiers[d.tier] || deptColor(d.color)
              const fill = CHART.tierFills[d.tier] || accentFill(d.color)
              return (
                <div key={d.tier} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: C.textSub, fontWeight: 600 }}>{d.tier}</span>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: col }}>{(d.credits / llmTotal * 100).toFixed(0)}%</span>
                      <span style={{ fontSize: 12, color: C.subtle }}>{d.credits.toLocaleString(LOCALE)}</span>
                    </div>
                  </div>
                  <MiniBar value={d.credits / llmTotal * 100} color={fill} height={10} />
                </div>
              )
            })}
          </Card>
        </div>
        <Card>
          <SH title="Tool mix by department" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.glassBorder}` }}>
                  {["Department", "Chat", "Excel", "Coding IDE", "Profile"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEPT.map((d, i) => {
                  const profile = getProfile(d)
                  const col = deptColor(d.color)
                  const fill = accentFill(d.color)
                  return (
                    <tr key={d.d} style={{ borderBottom: `1px solid ${C.glassBorder}`, background: i % 2 === 0 ? C.surface2 : "transparent" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: fill }} />
                          <span style={{ fontWeight: 600, color: C.text }}>{d.d}</span>
                        </div>
                      </td>
                      {[[d.chat, CHART.tools.Chat, CHART.toolFills.Chat], [d.excel, CHART.tools.Excel, CHART.toolFills.Excel], [d.coding, CHART.tools["Coding IDE"], CHART.toolFills["Coding IDE"]]].map(([v, textColor, barColor], j) => (
                        <td key={j} style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 55 }}><MiniBar value={v} color={barColor} height={6} /></div>
                            <span style={{ fontWeight: v > 50 ? 700 : 400, color: v > 50 ? textColor : C.subtle, fontSize: 12 }}>{v}%</span>
                          </div>
                        </td>
                      ))}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: `${profile.color}18`, color: profile.color, border: `1px solid ${profile.color}35` }}>{profile.label}</span>
                      </td>
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <ExecutiveInsight
        badge={DATA_TIERS.measured.label}
        badgeColor={DATA_TIERS.measured.color}
        see={`${mappingPct}% of provisioned users mapped to departments. ${DATA_QUALITY.unmapped_provisioned} unmapped (${DATA_QUALITY.unmapped_credits_pct}% of credits). ${DATA_QUALITY.excel_undefined_dept_rows} employees with Unknown department.`}
        matter="Department and process conclusions are only as reliable as employee-directory linkage."
        action="Resolve unmapped users before using department-level findings in investment decisions."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
        <KpiCard
          label="Mapped users"
          value={`${DATA_QUALITY.provisioned_mapped_to_dept}/${DATA_QUALITY.provisioned_total}`}
          sub="Provisioned with department"
          color={CHART.primary}
        />
        <KpiCard
          label="Unmapped"
          value={DATA_QUALITY.unmapped_provisioned}
          sub={`${DATA_QUALITY.unmapped_not_in_directory} not in directory`}
          color={C.amber}
        />
        <KpiCard
          label="Unknown dept."
          value={DATA_QUALITY.excel_undefined_dept_rows}
          sub="After normalization"
          color={C.muted}
        />
        <KpiCard
          label="Unmapped credits"
          value={`${DATA_QUALITY.unmapped_credits_pct}%`}
          sub="Of org-wide total"
          color={CHART.secondary}
        />
      </div>
    </div>
  )
}
