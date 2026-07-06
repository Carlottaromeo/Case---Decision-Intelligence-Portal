import { useState } from "react"
import { useMeasuredData } from "../context/DashboardDataContext"
import { C, CHART, LOCALE } from "../theme"
import { departmentUnknownNote } from "../data/dashboardCopy"
import { Card, SH, MiniBar, ExecutiveInsight } from "./UI"
import CardActionBar from "./CardActionBar"
import { ACTION_BAR_OFFSET } from "./cardActions"
const SORT_OPTIONS = [
  { key: "prov_rate",     label: "Access rate" },
  { key: "cr_week",       label: "Cr/week" },
  { key: "total_credits", label: "Credits used" },
]

function deptColor(d) {
  return d.color.startsWith("#") ? d.color : `#${d.color}`
}

export default function Dipartimenti({ onOpenInsights }) {
  const { DEPT, KPIs, DATA_QUALITY } = useMeasuredData()
  const [sortBy, setSortBy] = useState("cr_week")
  const [selected, setSelected] = useState(null)

  const sorted = [...DEPT].sort((a, b) => b[sortBy] - a[sortBy])
  const dept = selected ? DEPT.find(d => d.d === selected) : null
  const byAdoption = [...DEPT].sort((a, b) => b.prov_rate - a.prov_rate)
  const strongest = byAdoption[0]
  const weakest = byAdoption[byAdoption.length - 1]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <ExecutiveInsight
        see={`${strongest?.d ?? "—"} leads on access (${strongest?.prov_rate ?? "—"}%); ${weakest?.d ?? "—"} lags (${weakest?.prov_rate ?? "—"}%). ${KPIs.provisioned} employees provisioned.`}
        matter="Adoption quality varies sharply by department — high usage in some areas coexists with low access elsewhere."
        action={`Close the gap in ${weakest?.d ?? "lagging departments"} while sustaining momentum in ${strongest?.d ?? "leading departments"}.`}
      />

      <Card id="anomaly-dept-coverage">
        <CardActionBar
          info={{
            title: "How to use this table",
            items: [
              "Click a row to expand tool and tier breakdown for that department.",
              "Use the sort pills to reorder by Access rate, Cr/week, or Total credits.",
              `Department totals cover ${DATA_QUALITY.provisioned_mapped_to_dept} of ${DATA_QUALITY.provisioned_total} provisioned users.`,
            ],
          }}
          insights={onOpenInsights ? () => onOpenInsights({
            insightIds: ["high-intensity-incomplete-rollout", "low-adoption-unknown-cause"],
            title: "Department usage intensity",
            subtitle: "Access rates and credits per week",
          }) : null}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 12, paddingRight: ACTION_BAR_OFFSET }}>
          <SH title="Department comparison" />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SORT_OPTIONS.map(o => (
              <button key={o.key} onClick={() => setSortBy(o.key)} style={{
                padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                border: sortBy === o.key ? `1px solid ${C.accent}` : `1px solid ${C.glassBorder}`,
                background: sortBy === o.key ? C.accentDim : C.pillBg,
                color: sortBy === o.key ? C.accent : C.muted,
              }}>{o.label}</button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 8px", paddingRight: ACTION_BAR_OFFSET }}>
          {departmentUnknownNote()}
        </p>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 16px", paddingRight: ACTION_BAR_OFFSET }}>
          Department totals cover {DATA_QUALITY.provisioned_mapped_to_dept} of {DATA_QUALITY.provisioned_total} provisioned users.
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.glassBorder}` }}>
                {["Department", "Provisioned", "Outside rollout", "Access rate", "Cr/user (13w)", "Cr/week", "Credits used"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(d => {
                const col = deptColor(d)
                const isSelected = selected === d.d
                return (
                  <tr key={d.d}
                    onClick={() => setSelected(isSelected ? null : d.d)}
                    style={{
                      borderBottom: `1px solid ${C.glassBorder}`,
                      cursor: "pointer",
                      background: isSelected ? `${col}18` : "transparent",
                    }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: col, boxShadow: `0 0 6px ${col}88` }} />
                        <span style={{ fontWeight: 600, color: C.text }}>{d.d}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", color: C.textSub }}>{d.provisioned}/{d.total}</td>
                    <td style={{ padding: "12px 14px", color: d.gap > 100 ? C.red : C.muted, fontWeight: d.gap > 100 ? 700 : 400 }}>{d.gap}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60 }}><MiniBar value={d.prov_rate} color={col} /></div>
                        <span style={{ color: col, fontWeight: 700 }}>{d.prov_rate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", color: C.text, fontWeight: 700 }}>{d.cr_user.toLocaleString(LOCALE)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: d.cr_week >= 100 ? C.accent : d.cr_week >= 60 ? CHART.secondary : C.muted }}>
                        {d.cr_week}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: C.muted }}>{d.total_credits.toLocaleString(LOCALE)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {dept && (
        <Card accent={deptColor(dept)}>
          <CardActionBar
            info={{
              title: "How to read this breakdown",
              items: [
                "Tool mix shows credit share across Chat, Excel, and Coding IDE.",
                "LLM tier mix shows Instant, Thinking, and Pro usage shares.",
                "Click Close or the same row again to collapse this panel.",
              ],
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingRight: ACTION_BAR_OFFSET }}>
            <SH title={dept.d} sub={`${dept.provisioned} provisioned of ${dept.total} · ${dept.gap} outside rollout`} />
            <button onClick={() => setSelected(null)} style={{
              background: "none", border: `1px solid ${C.glassBorder}`, borderRadius: 12,
              padding: "4px 10px", color: C.muted, fontSize: 12,
            }}>Close</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Tool mix</div>
              {[["Chat", dept.chat, CHART.tools.Chat], ["Excel", dept.excel, CHART.tools.Excel], ["Coding IDE", dept.coding, CHART.tools["Coding IDE"]]].map(([t, v, col]) => (
                <div key={t} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                    <span style={{ color: C.textSub }}>{t}</span>
                    <span style={{ fontWeight: 700, color: col }}>{v}%</span>
                  </div>
                  <MiniBar value={v} color={col} height={8} />
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>LLM tier mix</div>
              {[["Instant", dept.instant, CHART.tiers.Instant], ["Thinking", dept.thinking, CHART.tiers.Thinking], ["Pro", dept.pro, CHART.tiers.Pro]].map(([t, v, col]) => (
                <div key={t} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                    <span style={{ color: C.textSub }}>{t}</span>
                    <span style={{ fontWeight: 700, color: col }}>{v}%</span>
                  </div>
                  <MiniBar value={v} color={col} height={8} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card id="high-consumption-signal">
        <CardActionBar
          info={{
            title: "How to read this signal",
            items: [
              "Counts provisioned users who consumed ≥500 credits in at least one week.",
              "Threshold flags unusually high weekly consumption for follow-up.",
            ],
          }}
          insights={onOpenInsights ? () => onOpenInsights({
            insightIds: ["high-consumption-signal"],
            title: "High consumption signal",
            subtitle: "Users with ≥500 credits in at least one week",
          }) : null}
        />
        <div style={{ marginBottom: 16, paddingRight: ACTION_BAR_OFFSET }}>
          <SH title="High consumption signal" sub="Users with ≥500 credits in at least one week" />
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: C.amber, letterSpacing: "-0.02em" }}>
          {KPIs.high_consumption_users}
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
          users above the weekly consumption threshold
        </div>
      </Card>

    </div>
  )
}
