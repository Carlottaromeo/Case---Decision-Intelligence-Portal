import { useMemo, useState } from "react"
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts"
import { C, CHART, LOCALE } from "../../theme"
import { Card, SH, KpiCard } from "../UI"
import CardActionBar from "../CardActionBar"
import { ACTION_BAR_OFFSET } from "../cardActions"
import { formatUsd } from "../../data/geminiCostModel"
import {
  buildCostSimulatorModel,
  buildCostCurve,
  buBreakdown,
  simulateCost,
  SIMULATOR_CAPTION,
} from "../../data/costSimulatorModel"

const CHART_COLORS = {
  total: CHART.primary,
  bu: CHART.tertiary,
  marker: CHART.secondary,
}

function CostCurveTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__title">{label}% company adoption</div>
      {point?.progress != null && (
        <div className="chart-tooltip__row" style={{ color: C.subtle, fontSize: 11 }}>
          <span>Rollout progress</span>
          <span>{point.progress}% toward full</span>
        </div>
      )}
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip__row">
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{formatUsd(p.value)}/mo</span>
        </div>
      ))}
    </div>
  )
}

function formatCostAxisTick(v) {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`
}

function ProgressSlider({
  id,
  label,
  sublabel,
  value,
  onChange,
  accent = CHART.primary,
  startTick,
  endTick,
}) {
  return (
    <div className="cost-sim__slider-block">
      <div className="cost-sim__slider-head">
        <label htmlFor={id} className="cost-sim__slider-label">{label}</label>
        {sublabel && <span className="cost-sim__slider-readout">{sublabel}</span>}
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="cost-sim__slider"
        style={{ "--slider-accent": accent, "--slider-fill": `${value}%` }}
      />
      <div className="cost-sim__slider-ticks">
        <span>{startTick ?? "Today (0% progress)"}</span>
        <span>{endTick ?? "Full rollout (100% progress)"}</span>
      </div>
    </div>
  )
}

export default function CostSimulator({
  deptRows,
  deptToolTierCredits,
  kpis,
  deptColors = {},
  onOpenInsights,
}) {
  const [pGlobal, setPGlobal] = useState(0)
  const [overrides, setOverrides] = useState({})
  const [isolatedBu, setIsolatedBu] = useState(null)

  const model = useMemo(
    () => buildCostSimulatorModel(deptRows, deptToolTierCredits, kpis),
    [deptRows, deptToolTierCredits, kpis]
  )

  const snapshot = useMemo(
    () => simulateCost(model, pGlobal / 100, overrides),
    [model, pGlobal, overrides]
  )

  const breakdown = useMemo(
    () => buBreakdown(model, pGlobal / 100, overrides),
    [model, pGlobal, overrides]
  )

  const curve = useMemo(
    () =>
      buildCostCurve(model, {
        overrides,
        isolatedBuId: isolatedBu,
      }),
    [model, overrides, isolatedBu]
  )

  const chartData = useMemo(() => {
    return curve.total.map((point, i) => ({
      ...point,
      label: `${point.progress}%`,
      buCost: curve.bu?.[i]?.buCost ?? null,
    }))
  }, [curve])

  const markerPoint = chartData.find((p) => p.progress === pGlobal) ?? chartData[0]

  const startAdoptionPct = model?.startAdoptionPct ?? 37
  const currentAdoptionPct = snapshot.adoptionPct

  const handleBuSelect = (buId) => {
    setIsolatedBu((prev) => (prev === buId ? null : buId))
  }

  const handleBuOverride = (value) => {
    if (!isolatedBu) return
    setOverrides((prev) => ({ ...prev, [isolatedBu]: value / 100 }))
  }

  const clearBuOverride = () => {
    if (!isolatedBu) return
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[isolatedBu]
      return next
    })
  }

  const isolatedRow = isolatedBu ? breakdown.find((b) => b.id === isolatedBu) : null
  const buOverrideValue =
    isolatedBu && overrides[isolatedBu] != null
      ? Math.round(overrides[isolatedBu] * 100)
      : pGlobal

  const isolatedBuAdoptionPct = isolatedRow?.total
    ? Math.round((isolatedRow.simulatedActive / isolatedRow.total) * 100)
    : 0

  const isolatedBuColor = isolatedBu ? (deptColors[isolatedBu] ?? CHART_COLORS.bu) : null
  const buChartMin = isolatedRow ? Math.round(isolatedRow.monthlyAtCurrent) : 0
  const buChartMax = isolatedRow ? Math.round(isolatedRow.monthlyAtFull) : 0

  return (
    <Card className="cost-sim">
      <CardActionBar
        info={{
          title: "Cost simulator",
          items: [
            "Linear adoption model: active users interpolate from today to full headcount per BU.",
            "Monthly cost = active × fixed avg weekly cost per active user × 13/3 (same-intensity assumption).",
            "30 no-department employees scale with the global slider at company-average rate.",
            "Per-BU overrides apply only to selected departments; others follow the global slider.",
          ],
        }}
        insights={
          onOpenInsights
            ? () =>
                onOpenInsights({
                  insightIds: ["cost-simulator-adoption"],
                  title: "Cost simulator",
                  subtitle: "Adoption-driven monthly spend",
                })
            : null
        }
      />

      <div style={{ marginBottom: 16, paddingRight: ACTION_BAR_OFFSET }}>
        <SH title="Cost simulator" sub="Projected monthly Gemini spend as adoption scales" />
      </div>

      <div className={`cost-sim__kpi-row${isolatedBu ? " cost-sim__kpi-row--isolated" : ""}`}>
        <KpiCard
          label="Company monthly cost"
          value={formatUsd(snapshot.totalCost)}
          sub={`${formatUsd(snapshot.totalCost * 12)}/yr · ${snapshot.displayActive.toLocaleString(LOCALE)} active (${currentAdoptionPct}%)`}
          color={CHART.primary}
          highlight={!isolatedBu}
        />
        {isolatedBu && isolatedRow ? (
          <>
            <KpiCard
              label={`${isolatedBu} monthly cost`}
              value={formatUsd(isolatedRow.simulatedCost)}
              sub={`${isolatedRow.simulatedActive.toLocaleString(LOCALE)} / ${isolatedRow.total.toLocaleString(LOCALE)} active · ${isolatedBuAdoptionPct}% BU adoption`}
              color={isolatedBuColor}
              highlight
            />
            <KpiCard
              label={`${isolatedBu} at full adoption`}
              value={formatUsd(Math.round(isolatedRow.monthlyAtFull))}
              sub={`${isolatedRow.total.toLocaleString(LOCALE)} headcount · 100% BU adoption`}
              color={isolatedBuColor}
            />
          </>
        ) : (
          <KpiCard
            label="At full adoption"
            value={formatUsd(model?.fullMonthly ?? 0)}
            sub={`${model?.totalEmployees?.toLocaleString(LOCALE) ?? "—"} employees · 100%`}
            color={CHART.tertiary}
          />
        )}
      </div>

      <ProgressSlider
        id="cost-sim-global"
        label="Global rollout progress"
        sublabel={`Company adoption ${startAdoptionPct}% → 100% · now ${currentAdoptionPct}% (${pGlobal}% progress)`}
        value={pGlobal}
        onChange={setPGlobal}
        startTick={`Today · ${startAdoptionPct}% adoption`}
        endTick={`Full rollout · 100% adoption`}
      />

      <div className="cost-sim__bu-controls">
        <div className="cost-sim__bu-select-wrap">
          <label htmlFor="cost-sim-bu" className="cost-sim__bu-select-label">
            Isolate BU
          </label>
          <select
            id="cost-sim-bu"
            className="cost-sim__bu-select"
            value={isolatedBu ?? ""}
            onChange={(e) => setIsolatedBu(e.target.value || null)}
          >
            <option value="">All departments</option>
            {breakdown.map((row) => (
              <option key={row.id} value={row.id}>
                {row.id}
                {row.hasOverride ? " (override)" : ""}
              </option>
            ))}
          </select>
        </div>

        {isolatedBu && (
          <div className="cost-sim__bu-override">
            <ProgressSlider
              id="cost-sim-bu-override"
              label={`${isolatedBu} — targeted progress`}
              sublabel={
                overrides[isolatedBu] != null
                  ? `Override ${buOverrideValue}% · BU adoption ${isolatedBuAdoptionPct}% (${isolatedRow?.simulatedActive}/${isolatedRow?.total})`
                  : `Following global · BU adoption ${isolatedBuAdoptionPct}%`
              }
              value={buOverrideValue}
              onChange={handleBuOverride}
              accent={deptColors[isolatedBu] ?? CHART.secondary}
            />
            {overrides[isolatedBu] != null && (
              <button type="button" className="cost-sim__clear-override" onClick={clearBuOverride}>
                Clear override · back to global
              </button>
            )}
          </div>
        )}
      </div>

      <div className="cost-sim__chart-wrap">
        <div className="cost-sim__chart-head">
          <span className="cost-sim__chart-title">Cost curve</span>
          <div className="cost-sim__chart-legend">
            <span>
              <i style={{ background: CHART_COLORS.total, opacity: isolatedBu ? 0.45 : 1 }} />
              Total monthly{isolatedBu ? " · left axis" : ""}
            </span>
            {isolatedBu && (
              <span>
                <i style={{ background: isolatedBuColor }} />
                {isolatedBu} · right axis
              </span>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart
            data={chartData}
            margin={{ left: 4, right: isolatedBu ? 48 : 12, top: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="adoptionPct"
              tick={{ fill: C.subtle, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[startAdoptionPct, 100]}
              tickFormatter={(v) => `${v}%`}
              label={{ value: "Company adoption rate", position: "insideBottom", offset: -2, fill: C.subtle, fontSize: 10 }}
            />
            <YAxis
              yAxisId="total"
              tick={{ fill: C.subtle, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={52}
              domain={[model?.baselineMonthly ?? 4700, model?.fullMonthly ?? 9500]}
              tickFormatter={formatCostAxisTick}
            />
            {isolatedBu && (
              <YAxis
                yAxisId="bu"
                orientation="right"
                tick={{ fill: isolatedBuColor ?? C.subtle, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={48}
                domain={[buChartMin, buChartMax]}
                tickFormatter={formatCostAxisTick}
              />
            )}
            <Tooltip content={<CostCurveTooltip />} />
            <Line
              yAxisId="total"
              type="monotone"
              dataKey="totalCost"
              name="Total (company)"
              stroke={CHART_COLORS.total}
              strokeWidth={isolatedBu ? 2 : 2.5}
              strokeOpacity={isolatedBu ? 0.35 : 1}
              dot={false}
            />
            {isolatedBu && (
              <Line
                yAxisId="bu"
                type="monotone"
                dataKey="buCost"
                name={isolatedBu}
                stroke={isolatedBuColor}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={false}
                connectNulls
              />
            )}
            {markerPoint && (
              <ReferenceDot
                yAxisId="total"
                x={currentAdoptionPct}
                y={snapshot.totalCost}
                r={isolatedBu ? 5 : 6}
                fill={CHART_COLORS.marker}
                fillOpacity={isolatedBu ? 0.5 : 1}
                stroke={C.surface}
                strokeWidth={2}
              />
            )}
            {isolatedBu && isolatedRow && (
              <ReferenceDot
                yAxisId="bu"
                x={currentAdoptionPct}
                y={isolatedRow.simulatedCost}
                r={6}
                fill={isolatedBuColor}
                stroke={C.surface}
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="cost-sim__breakdown">
        <div className="cost-sim__breakdown-head">
          <span>Per-BU breakdown</span>
          <span className="cost-sim__breakdown-hint">Click a row to isolate</span>
        </div>
        <div className="cost-sim__table-wrap">
          <table className="cost-sim__table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Active</th>
                <th>Monthly cost</th>
                <th>Avg wk credits/user</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row) => {
                const isSelected = isolatedBu === row.id
                const isDimmed = isolatedBu && !isSelected
                const color = deptColors[row.id] ?? CHART.primary
                return (
                  <tr
                    key={row.id}
                    className={[
                      "cost-sim__table-row",
                      isSelected ? "cost-sim__table-row--selected" : "",
                      isDimmed ? "cost-sim__table-row--dimmed" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => handleBuSelect(row.id)}
                    style={{ "--bu-accent": color }}
                  >
                    <td>
                      <span className="cost-sim__dept-cell">
                        <i className="cost-sim__dept-swatch" />
                        {row.id}
                        {row.hasOverride && (
                          <span className="cost-sim__override-badge">override</span>
                        )}
                      </span>
                    </td>
                    <td>
                      {row.simulatedActive.toLocaleString(LOCALE)}
                      <span className="cost-sim__cell-sub"> / {row.total.toLocaleString(LOCALE)}</span>
                    </td>
                    <td>{formatUsd(row.simulatedCost)}</td>
                    <td className="cost-sim__credits-ref">{Math.round(row.creditsPerWeek)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="cost-sim__caption">{SIMULATOR_CAPTION}</p>
    </Card>
  )
}
