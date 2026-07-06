import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts"
import { useMeasuredData } from "../context/DashboardDataContext"
import { C, CHART, LOCALE, readableAccent } from "../theme"
import { Card, SH, ChartTooltip, MiniBar } from "./UI"
import CardActionBar from "./CardActionBar"
import { ACTION_BAR_OFFSET } from "./cardActions"

function pctLabel(part, total) {
  if (!total) return "0%"
  return `${Math.round((part / total) * 1000) / 10}%`
}

export default function Utenti({ onOpenInsights }) {
  const { USER_SEGMENTS, SENIORITY, KPIs } = useMeasuredData()
  const segmentTotal = USER_SEGMENTS.reduce((s, x) => s + x.count, 0)
  const seniorityHeadcount = SENIORITY.reduce((s, x) => s + x.total_in_company, 0)
  const seniorityActive = SENIORITY.reduce((s, x) => s + x.active_users, 0)
  const companyTotal = KPIs.total_employees

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Card>
          <CardActionBar
            info={{
              title: "How to read segmentation",
              items: [
                "Segments classify provisioned users by weeks active in the period.",
                "Power User: active ≥70% of weeks · Regular: 30–70% · Occasional: <30%.",
              ],
            }}
            insights={onOpenInsights ? () => onOpenInsights({
              insightIds: ["gap-is-access-not-motivation"],
              title: "Engagement segmentation",
              subtitle: "How consistently provisioned users engage",
            }) : null}
          />
          <div style={{ paddingRight: ACTION_BAR_OFFSET }}>
            <SH title="Engagement segmentation" sub={`${segmentTotal} users with AI access`} />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={USER_SEGMENTS}
                dataKey="count"
                nameKey="segment"
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {USER_SEGMENTS.map((s, i) => (
                  <Cell key={i} fill={CHART.fills[i] || readableAccent(s.color)} stroke={C.surface} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {USER_SEGMENTS.map((s, i) => {
              const col = CHART.segments[i] || readableAccent(s.color)
              const fill = CHART.fills[i] || col
              return (
              <div key={s.segment} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: fill, boxShadow: `0 0 6px ${fill}88` }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.segment}</div>
                    <div style={{ fontSize: 11, color: C.subtle }}>{s.desc}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: col }}>{s.count}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{segmentTotal > 0 ? ((s.count / segmentTotal) * 100).toFixed(0) : 0}%</div>
                </div>
              </div>
            )})}
          </div>
        </Card>

        <Card>
          <CardActionBar
            info={{
              title: "How to use this chart",
              items: [
                "Bars show average credits per active user by seniority level.",
                "Only users with recorded usage in the period are included.",
                "Hover bars for exact values.",
              ],
            }}
            insights={onOpenInsights ? () => onOpenInsights({
              insightIds: ["seniority-intensity-gradient"],
              title: "Credits used by seniority level",
              subtitle: "Usage intensity across job levels",
            }) : null}
          />
          <div style={{ marginBottom: 18, paddingRight: ACTION_BAR_OFFSET }}>
            <SH title="Credits used by seniority level" sub="Average consumption among active users" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={SENIORITY} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="level" tick={{ fill: C.subtle, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} width={45}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="cr_user" name="Credits used/user" radius={[6, 6, 0, 0]}>
                {SENIORITY.map((_, i) => (
                  <Cell key={i} fill={CHART.fills[i % CHART.fills.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <CardActionBar
          info={{
            title: "How to read this table",
            items: [
              "In company: employees at each level in the directory (L1–L6 vs total headcount).",
              "AI active: provisioned users with recorded usage in the period.",
              "Intensity bar compares credits/user relative to the highest level.",
            ],
          }}
          insights={onOpenInsights ? () => onOpenInsights({
            insightIds: ["seniority-intensity-gradient", "gap-is-access-not-motivation"],
            title: "Seniority detail",
            subtitle: "Headcount vs AI-active users by level",
          }) : null}
        />
        <div style={{ paddingRight: ACTION_BAR_OFFSET }}>
          <SH
            title="Seniority detail"
            sub={`${seniorityHeadcount.toLocaleString(LOCALE)} L1–L6 in company (${pctLabel(seniorityHeadcount, companyTotal)} of ${companyTotal.toLocaleString(LOCALE)}) · ${seniorityActive.toLocaleString(LOCALE)} AI-active in period`}
          />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.glassBorder}` }}>
                {["Level", "In company", "AI active", "Credits used", "Credits used/user", "Intensity"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SENIORITY.map((s, i) => {
                const maxCr = Math.max(...SENIORITY.map(x => x.cr_user))
                const col = CHART.series[i % CHART.series.length]
                const fill = CHART.fills[i % CHART.fills.length]
                return (
                  <tr key={s.level} style={{ borderBottom: `1px solid ${C.glassBorder}`, background: i % 2 === 0 ? C.rowAlt : "transparent" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: col }}>{s.level}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 600, color: C.text }}>{s.total_in_company.toLocaleString(LOCALE)}</div>
                      <div style={{ fontSize: 11, color: C.subtle }}>{pctLabel(s.total_in_company, companyTotal)} of company</div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 600, color: C.text }}>{s.active_users.toLocaleString(LOCALE)}</div>
                      <div style={{ fontSize: 11, color: C.subtle }}>
                        {s.total_in_company > 0 ? `${s.ai_adoption_pct}% of level` : "—"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", color: C.muted }}>{s.credits.toLocaleString(LOCALE)}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: C.text }}>{s.cr_user.toLocaleString(LOCALE)}</td>
                    <td style={{ padding: "12px 14px", width: 120 }}>
                      <MiniBar value={s.cr_user} max={maxCr} color={fill} height={8} />
                    </td>
                  </tr>
                )
              })}
              <tr style={{ borderTop: `2px solid ${C.glassBorder}`, background: C.rowAlt, fontWeight: 700 }}>
                <td style={{ padding: "12px 14px", color: C.text }}>Total L1–L6</td>
                <td style={{ padding: "12px 14px", color: C.text }}>
                  {seniorityHeadcount.toLocaleString(LOCALE)}
                  <div style={{ fontSize: 11, fontWeight: 500, color: C.subtle }}>{pctLabel(seniorityHeadcount, companyTotal)} of company</div>
                </td>
                <td style={{ padding: "12px 14px", color: C.text }}>
                  {seniorityActive.toLocaleString(LOCALE)}
                  <div style={{ fontSize: 11, fontWeight: 500, color: C.subtle }}>
                    {seniorityHeadcount > 0 ? `${Math.round((seniorityActive / seniorityHeadcount) * 1000) / 10}% of level` : "—"}
                  </div>
                </td>
                <td style={{ padding: "12px 14px", color: C.muted }}>{SENIORITY.reduce((s, x) => s + x.credits, 0).toLocaleString(LOCALE)}</td>
                <td style={{ padding: "12px 14px", color: C.text }}>—</td>
                <td style={{ padding: "12px 14px" }} />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}
