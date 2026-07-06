import { useMemo, useState } from "react"
import { useMeasuredData } from "../context/DashboardDataContext"
import {
  buildWeeklyDemandSeries,
  buildForecastModel,
  SCENARIOS,
  METRICS,
} from "../data/forecastModel"
import { C, CHART, LOCALE } from "../theme"
import { SH, ExecutiveInsight, KpiCard } from "./UI"
import CardActionBar from "./CardActionBar"
import { ACTION_BAR_OFFSET } from "./cardActions"
import { LEVEL_COLORS } from "../data/processMapsMeta"
import { DATA_TIERS } from "../data/dashboardCopy"
import ForecastChart from "./forecast/ForecastChart"
import ForecastScenarioPanel from "./forecast/ForecastScenarioPanel"

export default function Forecasting({ view = "outlook" }) {
  const { WEEKLY, USAGE_RECORDS } = useMeasuredData()
  const [scenarioId, setScenarioId] = useState("baseline")

  const model = useMemo(() => {
    const weeklySeries = buildWeeklyDemandSeries(WEEKLY, USAGE_RECORDS)
    return buildForecastModel(weeklySeries)
  }, [])

  const { weeklySeries, overallGrowth8, overallConfidence, confidenceByMetric, scenarios } = model
  const activeScenario = scenarios.find((s) => s.id === scenarioId) || scenarios[1]
  const baselineCredits8 = model.metrics.credits.baseline.week8

  const insight = (
    <ExecutiveInsight
      badge={DATA_TIERS.simulated.label}
      badgeColor={DATA_TIERS.simulated.color}
      see={`Directional forecast: ${overallGrowth8 >= 0 ? "+" : ""}${overallGrowth8}% credit growth over 8 weeks (baseline). Week-8 estimate: ${baselineCredits8.toLocaleString(LOCALE)} credits.`}
      matter="Forward demand shapes licensing, capacity and enablement planning."
      action={`Plan for the ${activeScenario.label.toLowerCase()} scenario; review licensing if accelerated growth materialises.`}
    />
  )

  if (view === "scenarios") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.values(SCENARIOS).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenarioId(s.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                border: scenarioId === s.id ? `1px solid #${s.color}` : `1px solid ${C.glassBorder}`,
                background: scenarioId === s.id ? `#${s.color}18` : C.surface2,
                color: scenarioId === s.id ? `#${s.color}` : C.muted,
                cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {scenarios.map((scenario) => (
            <ForecastScenarioPanel
              key={scenario.id}
              scenario={scenario}
              confidence={confidenceByMetric.credits}
              active={scenario.id === scenarioId}
            />
          ))}
        </div>
        <div className="glass-panel" style={{ borderRadius: 12, padding: "16px 20px", overflowX: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Forecast summary — {activeScenario.label}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640, fontSize: 12 }}>
            <thead>
              <tr style={{ color: C.subtle, textTransform: "uppercase", fontSize: 10 }}>
                {["Metric", "Last actual", "Week 4", "Week 8", "8w total", "Confidence"].map((h) => (
                  <th key={h} style={{ textAlign: h === "Metric" ? "left" : "right", padding: "8px 10px", borderBottom: `1px solid ${C.glassBorder}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => {
                const last = weeklySeries[weeklySeries.length - 1]?.[m.key] ?? 0
                const fc = model.metrics[m.key][scenarioId]
                return (
                  <tr key={m.key} style={{ color: C.textSub }}>
                    <td style={{ padding: "10px", borderBottom: `1px solid ${C.glassBorder}`, fontWeight: 600, color: C.text }}>{m.label}</td>
                    <td style={{ padding: "10px", borderBottom: `1px solid ${C.glassBorder}`, textAlign: "right" }}>{last.toLocaleString(LOCALE)}</td>
                    <td style={{ padding: "10px", borderBottom: `1px solid ${C.glassBorder}`, textAlign: "right" }}>{fc.week4.toLocaleString(LOCALE)}</td>
                    <td style={{ padding: "10px", borderBottom: `1px solid ${C.glassBorder}`, textAlign: "right" }}>{fc.week8.toLocaleString(LOCALE)}</td>
                    <td style={{ padding: "10px", borderBottom: `1px solid ${C.glassBorder}`, textAlign: "right" }}>{fc.total8.toLocaleString(LOCALE)}</td>
                    <td style={{ padding: "10px", borderBottom: `1px solid ${C.glassBorder}`, textAlign: "right", color: LEVEL_COLORS[confidenceByMetric[m.key]] }}>{confidenceByMetric[m.key]}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {insight}
      <div className="glass-panel" style={{ position: "relative", padding: "20px 24px" }}>
        <CardActionBar
          info={{
            title: "Forecast methodology",
            items: [
              "Based on 13 weeks of measured usage history.",
              "Directional model: linear trend + 4-week moving average.",
              "Conservative / Accelerated adjust trend by ±25%.",
            ],
          }}
        />
        <div style={{ paddingRight: ACTION_BAR_OFFSET, marginBottom: 20 }}>
          <SH title="8-week outlook" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
          <KpiCard label="Expected growth (8w)" value={`${overallGrowth8 >= 0 ? "+" : ""}${overallGrowth8}%`} sub="Baseline vs last week" color={CHART.primary} highlight />
          <KpiCard label="Confidence" value={overallConfidence} sub="Directional" color={LEVEL_COLORS[overallConfidence]} />
          <KpiCard label="Last week credits" value={weeklySeries[weeklySeries.length - 1]?.credits.toLocaleString(LOCALE)} sub={weeklySeries[weeklySeries.length - 1]?.week} color={CHART.tertiary} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {Object.values(SCENARIOS).map((s) => (
            <button key={s.id} type="button" onClick={() => setScenarioId(s.id)} style={{
              padding: "8px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              border: scenarioId === s.id ? `1px solid #${s.color}` : `1px solid ${C.glassBorder}`,
              background: scenarioId === s.id ? `#${s.color}18` : C.surface2,
              color: scenarioId === s.id ? `#${s.color}` : C.muted, cursor: "pointer",
            }}>{s.label}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {METRICS.map((m) => (
            <ForecastChart key={m.key} weeklySeries={weeklySeries} metricKey={m.key} metricLabel={m.label} color={m.color} scenarioId={scenarioId} />
          ))}
        </div>
      </div>
    </div>
  )
}
