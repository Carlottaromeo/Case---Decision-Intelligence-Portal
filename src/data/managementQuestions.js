import { computeProcessMetrics } from "./computeProcessMetrics"
import {
  buildInvestmentPortfolio,
  rankInvestmentPortfolio,
} from "./investmentPlanner"
import {
  buildWeeklyDemandSeries,
  buildForecastModel,
} from "./forecastModel"
import {
  buildActionPlans,
  loadActionStatuses,
  mergeActionStatuses,
  sortActionPlans,
} from "./actionPlanTracker"
import { generateProcessRecommendation } from "./generateProcessRecommendation"
import { DATA_TIERS } from "./dashboardCopy"
import { loadStoredProcessFilters } from "./processFilters"
import {
  DEPT,
  KPIs,
  DATA_QUALITY,
  WEEKLY,
  USAGE_RECORDS,
  PROCESS_WEEKS,
  DEPT_COLORS,
  EMPLOYEE_ROSTER,
} from "./data"

const M = DATA_TIERS.measured.label
const S = DATA_TIERS.simulated.label
const F = DATA_TIERS.future.label

export const MANAGEMENT_QUESTIONS = [
  { id: "strongest-adoption", title: "Where is AI adoption strongest?", hint: "Measured adoption" },
  { id: "weakest-adoption", title: "Where is AI adoption weakest?", hint: "Measured adoption" },
  { id: "need-activation", title: "Which departments need activation?", hint: "Simulated priority" },
  { id: "invest-first", title: "Which representative processes should receive investment first?", hint: "Simulated ranking" },
  { id: "scale-adoption", title: "Where should we scale existing AI adoption?", hint: "Simulated scale" },
  { id: "future-usage", title: "What is the expected future AI usage?", hint: "Measured + simulated" },
  { id: "data-quality", title: "Which data quality issues affect the analysis?", hint: "Measured reconciliation" },
  { id: "open-actions", title: "Which management actions are currently open?", hint: "Simulated tracker" },
]

export function loadManagementContext() {
  const filters = loadStoredProcessFilters(PROCESS_WEEKS)
  const processMaps = computeProcessMetrics(
    EMPLOYEE_ROSTER,
    USAGE_RECORDS,
    PROCESS_WEEKS,
    DEPT_COLORS,
    filters
  )
  const portfolio = buildInvestmentPortfolio(processMaps)
  const ranked = rankInvestmentPortfolio(portfolio)
  const weeklySeries = buildWeeklyDemandSeries(WEEKLY, USAGE_RECORDS)
  const forecast = buildForecastModel(weeklySeries)
  const actionPlans = sortActionPlans(
    mergeActionStatuses(buildActionPlans(processMaps), loadActionStatuses())
  )
  return { dept: DEPT, processMaps, ranked, forecast, weeklySeries, actionPlans, kpis: KPIs }
}

function processRow(map, extra = {}) {
  return {
    title: map.department,
    subtitle: map.process_name,
    lines: [
      `${M}: ${map.adoption_rate}% adoption (${map.active_users} active / ${map.total_employees} employees)`,
      `${S}: AI potential ${map.ai_potential} · priority ${map.management_action}`,
    ],
    badges: [M, S],
    ...extra,
  }
}

function answerStrongest(ctx) {
  const top = [...ctx.processMaps].sort((a, b) => b.adoption_rate - a.adoption_rate).slice(0, 3)
  return {
    headline: "Departments with the highest measured adoption rate in the observation period.",
    measured: [
      `Active employee = at least one session or credits > 0 (${M}).`,
      `Org provisioning rate: ${ctx.kpis.provisioning_rate}% (${ctx.kpis.provisioned} of ${ctx.kpis.total_employees}).`,
    ],
    simulated: [],
    future: [],
    items: top.map((m, i) => processRow(m, { rank: i + 1 })),
  }
}

function answerWeakest(ctx) {
  const bottom = [...ctx.processMaps].sort((a, b) => a.adoption_rate - b.adoption_rate).slice(0, 3)
  return {
    headline: "Departments with the lowest measured adoption — highest activation risk.",
    measured: [
      `${bottom[0]?.total_employees ?? 0}+ employees in scope; adoption from usage export joined to directory.`,
    ],
    simulated: [],
    future: [],
    items: bottom.map((m, i) => processRow(m, { rank: i + 1 })),
  }
}

function answerActivation(ctx) {
  const activate = ctx.processMaps.filter((m) => m.management_action === "Activate")
  return {
    headline: "Representative processes flagged for Activate — high simulated AI potential with low measured adoption.",
    measured: ["Adoption rate and active employees are measured from the usage export."],
    simulated: [
      "Activate priority comes from the adoption × AI potential matrix (assumption-based).",
    ],
    future: ["Future workflow data could refine which steps to activate first."],
    items: activate.map((m, i) => processRow(m, { rank: i + 1 })),
  }
}

function answerInvestFirst(ctx) {
  const items = ctx.ranked.slice(0, 6).map((item, i) => {
    const map = ctx.processMaps.find((m) => m.department === item.department)
    const rec = map ? generateProcessRecommendation(map) : null
    const trend = rec?.signals?.creditsTrend ?? "—"
    return {
      rank: i + 1,
      title: item.process_name,
      subtitle: item.department,
      lines: [
        `${M}: ${item.adoption_rate}% adoption · ${map?.total_employees ?? "—"} employees · credits trend ${trend}`,
        `${S}: AI potential ${item.ai_potential} · gap ${item.adoption_gap} · priority ${item.investment_priority}`,
        `${S}: Recommended ${item.recommended_investment} · impact ${item.estimated_impact}`,
      ],
      badges: [M, S],
    }
  })
  return {
    headline: "Simulated processes ranked for investment — low adoption, high potential, gap, and priority drive order.",
    measured: [
      "Ranking inputs: measured adoption rate, department size (employee count), weekly credits trend.",
    ],
    simulated: [
      "AI potential, adoption gap, investment priority, and recommended investment type are simulated.",
    ],
    future: [],
    items,
  }
}

function answerScale(ctx) {
  const scale = ctx.processMaps.filter((m) => m.management_action === "Scale")
  return {
    headline: "Processes where measured adoption and simulated AI potential support scaling investment.",
    measured: ["High adoption rates among department employees with recorded usage."],
    simulated: ["Scale priority assigned when adoption and AI potential are both high."],
    future: ["Productivity KPIs and ROI would validate scale decisions in a future release."],
    items: scale.map((m, i) => processRow(m, { rank: i + 1 })),
  }
}

function answerFutureUsage(ctx) {
  const { forecast, weeklySeries, kpis } = ctx
  const last = weeklySeries[weeklySeries.length - 1]
  const baseline = forecast.metrics.credits.baseline
  return {
    headline: "Directional 8-week outlook from measured weekly history and a simple simulated trend model.",
    measured: [
      `${weeklySeries.length} weeks of history · last week ${last?.credits?.toLocaleString()} credits, ${last?.active_users} active users.`,
      `Observed growth week 1→13: +${kpis.growth_pct}% credits.`,
    ],
    simulated: [
      `Baseline 8-week forecast: ${baseline.total8.toLocaleString()} total credits · week-8 point ${baseline.week8.toLocaleString()} (+${forecast.overallGrowth8}% vs last actual).`,
      `Confidence: ${forecast.overallConfidence} · scenarios adjust trend ±25%.`,
    ],
    future: [
      `${F}: License capacity, workflow-linked demand, and ROI validation are not in this MVP.`,
    ],
    items: forecast.scenarios.map((sc) => ({
      title: sc.label,
      subtitle: `${sc.credits.total8.toLocaleString()} credits (8w total)`,
      lines: [sc.implication],
      badges: [S],
    })),
  }
}

function answerDataQuality() {
  const dq = DATA_QUALITY
  return {
    headline: "Measured reconciliation issues between the usage export and employee directory.",
    measured: [
      `${dq.unmapped_provisioned} of ${dq.provisioned_total} provisioned IDs unmapped to a department.`,
      `${dq.unmapped_credits.toLocaleString()} credits (${dq.unmapped_credits_pct}%) attributed to unmapped users.`,
      `${dq.excel_undefined_dept_rows} directory rows with Unknown department after normalization.`,
    ],
    simulated: [],
    future: [],
    items: [
      {
        title: "Unmapped provisioned users",
        subtitle: `${dq.unmapped_not_in_directory} not in directory · ${dq.unmapped_missing_dept_field} missing dept.`,
        lines: [
          `${M}: Included in org-wide KPIs, excluded from department breakdowns.`,
          `${dq.provisioned_mapped_to_dept} users mapped to departments for dept-level views.`,
        ],
        badges: [M],
      },
      {
        title: "Unknown department bucket",
        subtitle: `${dq.excel_undefined_dept_rows} employees`,
        lines: [`${M}: Normalized from missing or unrecognized department values.`],
        badges: [M],
      },
    ],
  }
}

function answerOpenActions(ctx) {
  const open = ctx.actionPlans.filter((p) => p.status !== "Completed")
  return {
    headline: `${open.length} simulated management actions not yet completed (status from local tracker).`,
    measured: [],
    simulated: ["Actions derived from investment priority and AI recommendations — not operational tasks."],
    future: [],
    items: open.map((p, i) => ({
      rank: i + 1,
      title: p.action_title,
      subtitle: `${p.process_name} · ${p.department}`,
      lines: [
        `Status: ${p.status} · Owner: ${p.suggested_owner}`,
        `Priority: ${p.priority} · Timeframe: ${p.target_timeframe}`,
        `Source: ${p.source_recommendation}`,
      ],
      badges: [S],
    })),
  }
}

const ANSWERERS = {
  "strongest-adoption": answerStrongest,
  "weakest-adoption": answerWeakest,
  "need-activation": answerActivation,
  "invest-first": answerInvestFirst,
  "scale-adoption": answerScale,
  "future-usage": answerFutureUsage,
  "data-quality": () => answerDataQuality(),
  "open-actions": answerOpenActions,
}

export function answerManagementQuestion(questionId, ctx) {
  const fn = ANSWERERS[questionId]
  if (!fn) return null
  return fn(ctx)
}

export { M as TIER_MEASURED, S as TIER_SIMULATED, F as TIER_FUTURE }
