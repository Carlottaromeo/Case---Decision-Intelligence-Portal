import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { C, CHART } from "../../theme"
import { ChartTooltip } from "../UI"
import { buildChartData } from "../../data/forecastModel"

export default function ForecastChart({ weeklySeries, metricKey, metricLabel, color, scenarioId }) {
  const data = buildChartData(weeklySeries, metricKey, scenarioId)
  const splitIndex = weeklySeries.length - 1

  return (
    <div className="glass-panel" style={{ borderRadius: 14, padding: "12px 8px 8px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, padding: "0 12px 8px" }}>{metricLabel}</div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="week" tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: C.subtle, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
          />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine
            x={data[splitIndex]?.week}
            stroke={C.glassBorderL}
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke={color}
            fill={`${color}33`}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecast"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 2, fill: color }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="forecast4"
            name="4-week horizon"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="2 3"
            dot={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 16, padding: "4px 12px 0", fontSize: 10, color: C.subtle }}>
        <span><span style={{ color }}>—</span> Actual</span>
        <span><span style={{ color, opacity: 0.8 }}>- -</span> Forecast (8w)</span>
      </div>
    </div>
  )
}
