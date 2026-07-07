import { useState } from "react"
import { useMeasuredData } from "../context/DashboardDataContext"
import { C, CHART, LOCALE, accentFill } from "../theme"
import { departmentUnknownNote } from "../data/dashboardCopy"
import { Card, SH, ExecutiveInsight } from "./UI"
import CardActionBar from "./CardActionBar"
import { ACTION_BAR_OFFSET } from "./cardActions"

const SORT_OPTIONS = [
  { key: "prov_rate", label: "Adoption %" },
  { key: "provisioned", label: "Provisioned users" },
  { key: "cr_week", label: "Cr/week avg" },
  { key: "cr_user", label: "Cr/user (13w)" },
  { key: "total_credits", label: "Total credits" },
]

const COLUMNS = [
  { key: "department", label: "Department" },
  { key: "provisioned", label: "Provisioned users" },
  { key: "adoption", label: "Adoption %" },
  { key: "gap", label: "Outside rollout" },
  { key: "cr_user", label: "Cr/user (13w)" },
  { key: "cr_week", label: "Cr/week avg" },
  { key: "total_credits", label: "Total credits" },
]

export default function Dipartimenti({ onOpenInsights }) {
  const { DEPT, KPIs, DATA_QUALITY } = useMeasuredData()
  const [sortBy, setSortBy] = useState("prov_rate")

  const sorted = [...DEPT].sort((a, b) => b[sortBy] - a[sortBy])
  const byAdoption = [...DEPT].sort((a, b) => b.prov_rate - a.prov_rate)
  const strongest = byAdoption[0]
  const weakest = byAdoption[byAdoption.length - 1]

  const totals = DEPT.reduce(
    (acc, d) => ({
      provisioned: acc.provisioned + d.provisioned,
      gap: acc.gap + d.gap,
      total_credits: acc.total_credits + d.total_credits,
    }),
    { provisioned: 0, gap: 0, total_credits: 0 }
  )
  const weeks = KPIs.weeks ?? 13
  totals.cr_user = totals.provisioned > 0 ? Math.round(totals.total_credits / totals.provisioned) : 0
  totals.cr_week =
    totals.provisioned > 0
      ? Math.round((totals.total_credits / totals.provisioned / weeks) * 10) / 10
      : 0
  totals.adoption = totals.provisioned + totals.gap > 0
    ? Math.round((totals.provisioned / (totals.provisioned + totals.gap)) * 1000) / 10
    : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ExecutiveInsight
        see={`${strongest?.d ?? "—"} leads on access (${strongest?.prov_rate ?? "—"}%); ${weakest?.d ?? "—"} lags (${weakest?.prov_rate ?? "—"}%). ${KPIs.provisioned} provisioned users.`}
        matter="Adoption quality varies sharply by department — high usage in some areas coexists with low access elsewhere."
        action={`Close the gap in ${weakest?.d ?? "lagging departments"} while sustaining momentum in ${strongest?.d ?? "leading departments"}.`}
      />

      <Card id="anomaly-dept-coverage">
        <CardActionBar
          info={{
            title: "How to use this table",
            items: [
              "Provisioned users = employees with AI access in the department.",
              "Outside rollout = employees in the department without AI access.",
              `Cr/user (13w) = total credits in period divided by provisioned users in period (${weeks} weeks).`,
              `Cr/week avg = average credits per provisioned user per week over the same ${weeks}-week period.`,
              "Use the sort pills to reorder by provisioned users, Cr/week, Cr/user, or total credits.",
              `Department totals cover ${DATA_QUALITY.provisioned_mapped_to_dept} of ${DATA_QUALITY.provisioned_total} provisioned users.`,
            ],
          }}
          insights={onOpenInsights ? () => onOpenInsights({
            insightIds: ["high-intensity-incomplete-rollout", "low-adoption-unknown-cause"],
            title: "Department usage intensity",
            subtitle: "Provisioned users and credits per week",
          }) : null}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 12, paddingRight: ACTION_BAR_OFFSET }}>
          <SH title="Department comparison" />
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              borderRadius: 999,
              border: `1px solid ${C.glassBorder}`,
              background: C.pillBg,
            }}
          >
            <span style={{ color: C.muted, fontSize: 13 }} title="Reorder">
              ⇅
            </span>
            <select
              aria-label="Reorder departments"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                color: C.text,
                fontSize: 12,
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 16px", paddingRight: ACTION_BAR_OFFSET }}>
          {departmentUnknownNote()}
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.glassBorder}` }}>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: "10px 14px",
                      textAlign: col.key === "department" ? "left" : "right",
                      color: C.muted,
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => {
                const fill = accentFill(d.color)
                return (
                  <tr key={d.d} style={{ borderBottom: `1px solid ${C.glassBorder}` }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background: fill,
                            boxShadow: `0 0 6px ${fill}88`,
                          }}
                        />
                        <span style={{ fontWeight: 600, color: C.text }}>{d.d}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: C.textSub }}>
                      {d.provisioned.toLocaleString(LOCALE)}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: C.text }}>
                      {d.prov_rate}%
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        textAlign: "right",
                        color: d.gap > 100 ? C.red : C.muted,
                        fontWeight: d.gap > 100 ? 700 : 400,
                      }}
                    >
                      {d.gap.toLocaleString(LOCALE)}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: C.text, fontWeight: 700 }}>
                      {d.cr_user.toLocaleString(LOCALE)}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: d.cr_week >= 100 ? C.accent : d.cr_week >= 60 ? CHART.secondary : C.muted,
                        }}
                      >
                        {d.cr_week}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: C.muted }}>
                      {d.total_credits.toLocaleString(LOCALE)}
                    </td>
                  </tr>
                )
              })}
              <tr style={{ borderTop: `2px solid ${C.glassBorder}`, background: C.pillBg }}>
                <td style={{ padding: "12px 14px", fontWeight: 800, color: C.text }}>Total</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: C.text }}>
                  {totals.provisioned.toLocaleString(LOCALE)}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: C.text }}>
                  {totals.adoption}%
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: C.text }}>
                  {totals.gap.toLocaleString(LOCALE)}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: C.text }}>
                  {totals.cr_user.toLocaleString(LOCALE)}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: C.accent }}>
                  {totals.cr_week}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: C.text }}>
                  {totals.total_credits.toLocaleString(LOCALE)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

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
