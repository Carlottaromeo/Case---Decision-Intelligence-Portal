import { ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { C, CHART } from "../../theme"
import { ChartTooltip } from "../UI"
import { deptColor } from "../../data/processMapsMeta"

export default function ProcessWeeklyTrends({ map }) {
  const col = deptColor(map.color)
  const activeData = map.weekly_active_users_trend || []
  const creditsData = map.weekly_credits_trend || []

  if (!activeData.length) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
        Measured weekly trends
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <div className="glass-panel" style={{ borderRadius: 14, padding: "12px 8px 8px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, padding: "0 12px 8px" }}>Active users per week</div>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={activeData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="active_users" name="Active users" stroke={col} fill={`${col}33`} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-panel" style={{ borderRadius: 14, padding: "12px 8px 8px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, padding: "0 12px 8px" }}>Credits per week</div>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={creditsData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} width={40}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="credits" name="Credits used" stroke={CHART.secondary} fill={`${CHART.secondary}33`} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
