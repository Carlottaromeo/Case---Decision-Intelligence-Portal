import { useMemo, useState } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { C, CHART, LOCALE } from "../theme"
import { Card, SH } from "./UI"
import CardActionBar from "./CardActionBar"
import { ACTION_BAR_OFFSET } from "./cardActions"
import {
  buildParamsFromScenario,
  computeGeminiCosts,
  computeGeminiCostsByDept,
  computeScenarioCostMap,
  computeToolCostSummaries,
  COST_PERIOD_MONTHS,
  emptyToolTierCredits,
  ESTIMATE_CAPTION,
  formatScenarioCostLine,
  formatUsd,
  formatUsdPerCredit,
  GEMINI_PRICES,
  SCENARIO_KEYS,
  SCENARIO_PRESETS,
} from "../data/geminiCostModel"

const BU_SORT_OPTIONS = [
  { key: "cost", label: "Est. cost" },
  { key: "costPerActiveUser", label: "$/active user" },
  { key: "credits", label: "Credits" },
]

const BU_TABLE_COLUMNS = [
  { key: "dept", label: "Department", align: "left", width: "22%" },
  { key: "activeUsers", label: "Active users", align: "right", width: "14%" },
  { key: "credits", label: "Credits", align: "right", width: "15%" },
  { key: "cost", label: "Est. cost", align: "right", width: "15%" },
  { key: "costPerActiveUser", label: "$/active user", align: "right", width: "15%" },
  { key: "topCostDriver", label: "Top cost driver", align: "right", width: "19%" },
]

function GroupedTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__title">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip__row">
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export default function GeminiEstimatedCosts({ toolTierCredits, deptToolTierCredits, deptRows, onOpenInsights }) {
  const [scenario, setScenario] = useState("central")
  const [buSortBy, setBuSortBy] = useState("cost")

  const credits = toolTierCredits ?? emptyToolTierCredits()
  const params = useMemo(() => buildParamsFromScenario(scenario), [scenario])
  const scenarioCosts = useMemo(() => computeScenarioCostMap(credits), [credits])

  const result = useMemo(() => computeGeminiCosts(credits, params), [credits, params])
  const toolSummaries = useMemo(
    () => computeToolCostSummaries(credits, params),
    [credits, params]
  )

  const deptMeta = useMemo(
    () => Object.fromEntries((deptRows ?? []).map((d) => [d.d, { active_users: d.active_users }])),
    [deptRows]
  )

  const deptCosts = useMemo(() => {
    const rows = computeGeminiCostsByDept(deptToolTierCredits, deptMeta, params)
    return [...rows].sort((a, b) => b[buSortBy] - a[buSortBy])
  }, [deptToolTierCredits, deptMeta, params, buSortBy])

  const deptTotals = useMemo(
    () =>
      deptCosts.reduce(
        (acc, row) => ({
          credits: acc.credits + row.credits,
          cost: acc.cost + row.cost,
          activeUsers: acc.activeUsers + row.activeUsers,
        }),
        { credits: 0, cost: 0, activeUsers: 0 }
      ),
    [deptCosts]
  )

  const activePreset = SCENARIO_PRESETS[scenario] ?? SCENARIO_PRESETS.central

  return (
    <Card>
      <CardActionBar
        info={{
          title: "Gemini cost model",
          items: [
            "Credits are converted to tokens per tier, then priced by tool-specific Gemini models.",
            "Derived $/credit per tool reflects the measured tier mix — Coding IDE costs more because it uses thinking/pro on 3.5 Flash.",
            "Department costs use the same model applied to each BU's tool × tier credits.",
          ],
        }}
        insights={onOpenInsights ? () => onOpenInsights({
          insightIds: ["gemini-cost-credit-gap"],
          title: "Gemini estimated costs",
          subtitle: "Cost model overview and scenarios",
        }) : null}
      />

      <div style={{ marginBottom: 16, paddingRight: ACTION_BAR_OFFSET }}>
        <SH
          title="Gemini estimated costs"
          sub={`Per-tier token model · ${COST_PERIOD_MONTHS}-month dataset · pay-as-you-go (Jul 2026)`}
        />
      </div>

      <div className="gemini-cost__scenario-bar">
        <div className="gemini-cost__scenario-toggle" role="group" aria-label="Usage intensity scenario">
          {SCENARIO_KEYS.map((key) => {
            const preset = SCENARIO_PRESETS[key]
            const costs = scenarioCosts[key]
            return (
              <button
                key={key}
                type="button"
                className={`gemini-cost__scenario-btn${scenario === key ? " gemini-cost__scenario-btn--active" : ""}`}
                onClick={() => setScenario(key)}
                aria-pressed={scenario === key}
              >
                <span className="gemini-cost__scenario-name">{preset.label}</span>
                <span className="gemini-cost__scenario-cost">
                  {formatScenarioCostLine(costs.totalCost, costs.monthlyCost, COST_PERIOD_MONTHS)}
                </span>
              </button>
            )
          })}
        </div>
        <p className="gemini-cost__scenario-note">{activePreset.summaryLine}</p>
      </div>

      <div className="gemini-cost__kpis">
        <div className="gemini-cost__kpi">
          <div className="gemini-cost__kpi-label">Total estimated cost</div>
          <div className="gemini-cost__kpi-value">{formatUsd(result.totalCost)}</div>
          <div className="gemini-cost__kpi-sub">{COST_PERIOD_MONTHS} months</div>
        </div>
        <div className="gemini-cost__kpi gemini-cost__kpi--accent">
          <div className="gemini-cost__kpi-label">Monthly run-rate</div>
          <div className="gemini-cost__kpi-value">{formatUsd(result.monthlyCost)}</div>
          <div className="gemini-cost__kpi-sub">avg / month</div>
        </div>
      </div>

      <div className="gemini-cost__tool-kpis">
        {toolSummaries.map((t) => (
          <div key={t.tool} className="gemini-cost__tool-kpi">
            <div className="gemini-cost__tool-kpi-name">{t.tool}</div>
            <div className="gemini-cost__tool-kpi-value">{formatUsdPerCredit(t.costPerCredit)}</div>
            <div className="gemini-cost__tool-kpi-sub">per credit · {t.tierHint || "no usage"}</div>
          </div>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        <CardActionBar
          info={{
            title: "Credits vs cost share",
            items: [
              "Purple bars = % of total credits by tool; amber = % of estimated Gemini cost.",
              "A wider gap between the two bars signals higher $/credit for that tool.",
              "Coding IDE typically shows the largest gap due to model and tier mix.",
            ],
          }}
          insights={onOpenInsights ? () => onOpenInsights({
            insightIds: ["gemini-cost-credit-gap"],
            title: "Credits vs cost by tool",
            subtitle: "Why credit share ≠ cost share",
          }) : null}
        />
        <ResponsiveContainer width="100%" height={300}>
        <BarChart data={result.chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }} barGap={4} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: C.subtle, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: C.subtle, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={42}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip content={<GroupedTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => <span style={{ color: C.muted }}>{value}</span>}
          />
          <Bar dataKey="pctCredits" name="% of credits" fill={CHART.primary} radius={[6, 6, 0, 0]} maxBarSize={48} />
          <Bar dataKey="pctCost" name="% of cost" fill={CHART.tools["Coding IDE"]} radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="gemini-cost__tool-summary">
        {result.tools.map((t) => (
          <div key={t.tool} className="gemini-cost__tool-row">
            <span className="gemini-cost__tool-name">{t.tool}</span>
            <span className="gemini-cost__tool-stat">{t.pctCredits.toFixed(1)}% credits</span>
            <span className="gemini-cost__tool-stat gemini-cost__tool-stat--cost">{t.pctCost.toFixed(1)}% cost</span>
            <span className="gemini-cost__tool-usd">{formatUsd(t.cost)}</span>
          </div>
        ))}
      </div>

      {deptCosts.length > 0 && (
        <div className="gemini-cost__bu-section" style={{ position: "relative" }}>
          <CardActionBar
            info={{
              title: "Department cost table",
              items: [
                "Est. cost applies the same token model to each BU's measured tool × tier credits.",
                "$/active user helps compare cost intensity independent of headcount.",
                "Top cost driver shows which tool dominates spend in that BU.",
              ],
            }}
            insights={onOpenInsights ? () => onOpenInsights({
              insightIds: ["high-intensity-incomplete-rollout", "gemini-cost-credit-gap"],
              title: "Estimated cost by department",
              subtitle: "Where Gemini spend concentrates",
            }) : null}
          />
          <div className="gemini-cost__bu-head" style={{ paddingRight: ACTION_BAR_OFFSET }}>
            <SH title="Estimated cost by department" sub="Same model applied per BU tool × tier mix" />
            <div className="gemini-cost__bu-sort">
              {BU_SORT_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className={`gemini-cost__bu-sort-btn${buSortBy === o.key ? " gemini-cost__bu-sort-btn--active" : ""}`}
                  onClick={() => setBuSortBy(o.key)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="gemini-cost__bu-table-wrap">
            <table className="gemini-cost__bu-table">
              <colgroup>
                {BU_TABLE_COLUMNS.map((col) => (
                  <col key={col.key} style={{ width: col.width }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {BU_TABLE_COLUMNS.map((col) => (
                    <th key={col.key} className={`gemini-cost__align-${col.align}`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptCosts.map((row) => (
                  <tr key={row.dept}>
                    <td className="gemini-cost__align-left gemini-cost__bu-dept">{row.dept}</td>
                    <td className="gemini-cost__align-right">{row.activeUsers.toLocaleString(LOCALE)}</td>
                    <td className="gemini-cost__align-right">{row.credits.toLocaleString(LOCALE)}</td>
                    <td className="gemini-cost__align-right">{formatUsd(row.cost)}</td>
                    <td className="gemini-cost__align-right">{formatUsd(row.costPerActiveUser)}</td>
                    <td className="gemini-cost__align-right gemini-cost__bu-driver">
                      {row.topCostDriver}
                      {row.topCostDriverPct > 0 && (
                        <span className="gemini-cost__bu-driver-pct"> {Math.round(row.topCostDriverPct)}%</span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="gemini-cost__bu-total">
                  <td className="gemini-cost__align-left gemini-cost__bu-dept">Total</td>
                  <td className="gemini-cost__align-right">{deptTotals.activeUsers.toLocaleString(LOCALE)}</td>
                  <td className="gemini-cost__align-right">{deptTotals.credits.toLocaleString(LOCALE)}</td>
                  <td className="gemini-cost__align-right">{formatUsd(deptTotals.cost)}</td>
                  <td className="gemini-cost__align-right">
                    {deptTotals.activeUsers > 0
                      ? formatUsd(deptTotals.cost / deptTotals.activeUsers)
                      : "—"}
                  </td>
                  <td className="gemini-cost__align-right">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="gemini-cost__estimate-caption">{ESTIMATE_CAPTION}</p>
      <p className="gemini-cost__prices-note">
        Models: Chat & Excel → {GEMINI_PRICES.Chat.model}; Coding IDE → {GEMINI_PRICES["Coding IDE"].model}.
      </p>
    </Card>
  )
}
