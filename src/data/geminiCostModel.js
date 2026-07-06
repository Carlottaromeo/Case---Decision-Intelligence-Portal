/** Gemini pay-as-you-go cost model — credits → tokens → USD by tool and tier. */

export const TOOLS = ["Chat", "Excel", "Coding IDE"]
export const TIERS = ["instant", "thinking", "pro"]

export const DEFAULT_TOKENS_PER_CREDIT = {
  instant: 2500,
  thinking: 9000,
  pro: 15000,
}

export const DEFAULT_OUTPUT_SHARE = {
  instant: 0.25,
  thinking: 0.45,
  pro: 0.55,
}

export const DEFAULT_CONTEXT_WEIGHT = {
  Chat: 1.0,
  Excel: 1.2,
  "Coding IDE": 1.6,
}

export const GEMINI_PRICES = {
  Chat: { model: "2.5 Flash-Lite", in: 0.1, out: 0.4 },
  Excel: { model: "2.5 Flash-Lite", in: 0.1, out: 0.4 },
  "Coding IDE": { model: "3.5 Flash", in: 1.5, out: 9.0 },
}

export const COST_PERIOD_MONTHS = 3

export const SCENARIO_PRESETS = {
  low: {
    label: "Light use",
    summaryLine:
      "Assumes fewer Gemini tokens per interaction — token prices are fixed (list price); only usage intensity changes.",
    tokensPerCredit: { instant: 2000, thinking: 7000, pro: 12000 },
    contextWeight: { Chat: 1.0, Excel: 1.2, "Coding IDE": 1.3 },
  },
  central: {
    label: "Expected",
    summaryLine:
      "Baseline usage intensity for your credit mix — token prices are fixed (list price); only usage intensity changes.",
    tokensPerCredit: { ...DEFAULT_TOKENS_PER_CREDIT },
    contextWeight: { ...DEFAULT_CONTEXT_WEIGHT },
  },
  high: {
    label: "Intensive (agentic)",
    summaryLine:
      "Assumes more Gemini tokens per interaction, including agentic workloads — token prices are fixed (list price); only usage intensity changes.",
    tokensPerCredit: { instant: 3000, thinking: 11000, pro: 18000 },
    contextWeight: { Chat: 1.0, Excel: 1.2, "Coding IDE": 2.0 },
  },
}

export const SCENARIO_KEYS = ["low", "central", "high"]

export const CENTRAL_PARAMS = {
  tokensPerCredit: DEFAULT_TOKENS_PER_CREDIT,
  outputShare: DEFAULT_OUTPUT_SHARE,
  contextWeight: DEFAULT_CONTEXT_WEIGHT,
  prices: GEMINI_PRICES,
  months: COST_PERIOD_MONTHS,
}

export const FALLBACK_TOOL_TIER_CREDITS = {
  Chat: { instant: 232890, thinking: 64265, pro: 15566 },
  Excel: { instant: 35557, thinking: 55648, pro: 31172 },
  "Coding IDE": { instant: 16768, thinking: 57946, pro: 68797 },
}

export const ESTIMATE_CAPTION =
  "Estimate. Token prices are fixed; the range reflects uncertainty in how many tokens each interaction consumes."

export function computeScenarioCostMap(toolTierCredits) {
  const credits = toolTierCredits ?? emptyToolTierCredits()
  return Object.fromEntries(
    SCENARIO_KEYS.map((key) => {
      const result = computeGeminiCosts(credits, buildParamsFromScenario(key))
      return [key, { totalCost: result.totalCost, monthlyCost: result.monthlyCost }]
    })
  )
}

export function formatScenarioCostLine(totalCost, monthlyCost, months = COST_PERIOD_MONTHS) {
  return `${formatUsd(totalCost)} / ${months}mo · ${formatUsd(monthlyCost)}/mo`
}

export function emptyToolTierCredits() {
  return {
    Chat: { instant: 0, thinking: 0, pro: 0 },
    Excel: { instant: 0, thinking: 0, pro: 0 },
    "Coding IDE": { instant: 0, thinking: 0, pro: 0 },
  }
}

export function buildParamsFromScenario(scenarioKey, overrides = {}) {
  const preset = SCENARIO_PRESETS[scenarioKey] ?? SCENARIO_PRESETS.central
  return {
    tokensPerCredit: { ...preset.tokensPerCredit, ...overrides.tokensPerCredit },
    outputShare: { ...DEFAULT_OUTPUT_SHARE, ...overrides.outputShare },
    contextWeight: { ...preset.contextWeight, ...overrides.contextWeight },
    prices: { ...GEMINI_PRICES, ...overrides.prices },
    months: overrides.months ?? COST_PERIOD_MONTHS,
  }
}

export function computeGeminiCosts(toolTierCredits, params = CENTRAL_PARAMS) {
  const {
    tokensPerCredit,
    outputShare,
    contextWeight,
    prices,
    months = COST_PERIOD_MONTHS,
  } = params

  let totalCost = 0
  let totalCredits = 0
  const byTool = {}

  for (const tool of TOOLS) {
    let toolCost = 0
    let toolCredits = 0
    const tierCredits = toolTierCredits?.[tool] ?? {}

    for (const tier of TIERS) {
      const credits = tierCredits[tier] ?? 0
      toolCredits += credits
      const tokens = credits * tokensPerCredit[tier] * contextWeight[tool]
      const outTok = tokens * outputShare[tier]
      const inTok = tokens - outTok
      toolCost += (inTok / 1e6) * prices[tool].in + (outTok / 1e6) * prices[tool].out
    }

    byTool[tool] = { credits: toolCredits, cost: toolCost }
    totalCost += toolCost
    totalCredits += toolCredits
  }

  const tools = TOOLS.map((tool) => ({
    tool,
    credits: byTool[tool].credits,
    cost: byTool[tool].cost,
    pctCredits: totalCredits > 0 ? (byTool[tool].credits / totalCredits) * 100 : 0,
    pctCost: totalCost > 0 ? (byTool[tool].cost / totalCost) * 100 : 0,
    color: tool === "Chat" ? "#6229FF" : tool === "Excel" ? "#0ea5e9" : "#f59e0b",
  }))

  return {
    totalCost,
    totalCredits,
    months,
    monthlyCost: totalCost / months,
    tools,
    chartData: tools.map((t) => ({
      name: t.tool,
      pctCredits: Math.round(t.pctCredits * 10) / 10,
      pctCost: Math.round(t.pctCost * 10) / 10,
      credits: t.credits,
      cost: t.cost,
    })),
  }
}

export function computeCostPerCreditByTool(result) {
  return Object.fromEntries(
    (result?.tools ?? []).map((t) => [
      t.tool,
      t.credits > 0 ? t.cost / t.credits : 0,
    ])
  )
}

export function formatUsdPerCredit(value) {
  if (value >= 0.01) return `$${value.toFixed(3)}`
  if (value >= 0.001) return `$${value.toFixed(4)}`
  return `$${value.toFixed(5)}`
}

function dominantTierLabel(toolTierCredits) {
  const tiers = toolTierCredits ?? {}
  const entries = TIERS.map((tier) => [tier, tiers[tier] ?? 0])
  const top = entries.sort((a, b) => b[1] - a[1])[0]
  if (!top || top[1] === 0) return ""
  const pct = entries.reduce((s, [, v]) => s + v, 0)
  const share = pct > 0 ? Math.round((top[1] / pct) * 100) : 0
  if (share >= 50) return `mostly ${top[0]}`
  return "mixed tiers"
}

export function computeToolCostSummaries(toolTierCredits, params = CENTRAL_PARAMS) {
  const result = computeGeminiCosts(toolTierCredits, params)
  return result.tools.map((t) => ({
    ...t,
    costPerCredit: t.credits > 0 ? t.cost / t.credits : 0,
    tierHint: dominantTierLabel(toolTierCredits?.[t.tool]),
  }))
}

export function computeGeminiCostsByDept(deptToolTierCredits, deptMeta = {}, params = CENTRAL_PARAMS) {
  if (!deptToolTierCredits) return []

  return Object.entries(deptToolTierCredits)
    .map(([dept, toolTier]) => {
      const meta = deptMeta[dept] ?? {}
      const result = computeGeminiCosts(toolTier, params)
      const toolBreakdown = result.tools.map((t) => ({
        tool: t.tool,
        credits: t.credits,
        cost: t.cost,
        pctCost: result.totalCost > 0 ? (t.cost / result.totalCost) * 100 : 0,
      }))
      const topDriver = [...toolBreakdown].sort((a, b) => b.pctCost - a.pctCost)[0]
      const activeUsers = meta.active_users ?? 0

      return {
        dept,
        credits: result.totalCredits,
        cost: result.totalCost,
        activeUsers,
        costPerActiveUser: activeUsers > 0 ? result.totalCost / activeUsers : 0,
        topCostDriver: topDriver?.tool ?? "—",
        topCostDriverPct: topDriver?.pctCost ?? 0,
        toolBreakdown,
      }
    })
    .filter((row) => row.credits > 0)
    .sort((a, b) => b.cost - a.cost)
}

export function formatUsd(value, { compact = false } = {}) {
  if (compact && value >= 1000) {
    return `$${(value / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
}
