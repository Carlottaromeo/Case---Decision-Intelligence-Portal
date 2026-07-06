import { INVESTMENT_BY_ACTION } from "./processAssumptions"
import { DATA_TIERS } from "./dashboardCopy"

const PRIORITY_BY_ACTION = {
  Scale: "P1 — High",
  Industrialize: "P2 — High",
  Activate: "P2 — High",
  "Quick win": "P3 — Medium",
  Monitor: "P4 — Low",
}

const OWNER_BY_ACTION = {
  Scale: "Department lead + AI Centre of Excellence",
  Industrialize: "Process owner + AI Champion",
  Activate: "Department lead + AI Champion",
  "Quick win": "Process owner + enablement lead",
  Monitor: "AI programme lead",
}

const KPI_BY_ACTION = {
  Scale: `${DATA_TIERS.measured.label}: adoption rate, avg credits per active user · ${DATA_TIERS.future.label}: productivity proxy`,
  Industrialize: `${DATA_TIERS.measured.label}: sessions per active user · ${DATA_TIERS.future.label}: credits per process step`,
  Activate: `${DATA_TIERS.measured.label}: weekly active users, adoption rate at 4 and 8 weeks`,
  "Quick win": `${DATA_TIERS.measured.label}: active users month-over-month; pilot completion rate`,
  Monitor: `${DATA_TIERS.measured.label}: adoption rate, weekly credits trend, provisioned coverage`,
}

const RULES = {
  "Low-High": {
    title: "Activate adoption with a focused illustrative pilot",
    message:
      "This representative process has high simulated AI potential but low measured department adoption. Prioritize a targeted pilot instead of generic training.",
    suggestedActions: [
      "Run an illustrative opportunity discovery workshop",
      "Create process-specific prompt templates for representative steps",
      "Identify 5–10 early adopters",
      "Track measured adoption after 4 and 8 weeks",
    ],
    expectedImpact: "High",
    investmentType: "Training",
  },
  "Medium-High": {
    title: "Industrialize projected usage",
    message:
      "AI usage is projected onto this process at department level, but is not yet systematically embedded into tracked workflows.",
    suggestedActions: [
      "Standardize best practices for illustrative steps",
      "Create reusable prompt templates",
      "Plan to connect usage to process KPIs when workflow data is integrated",
      "Scale enablement to the full department",
    ],
    expectedImpact: "High",
    investmentType: "Process Redesign",
  },
  "High-High": {
    title: "Scale and optimize investment",
    message:
      "This area shows strong measured department adoption. Focus on estimating potential productivity impact and scaling advanced illustrative opportunities.",
    suggestedActions: [
      "Estimate potential productivity gain (simulated — not measured ROI)",
      "Identify high-value illustrative advanced opportunities",
      "Evaluate premium licenses or custom assistants",
      "Share best practices across departments",
    ],
    expectedImpact: "High",
    investmentType: "Licenses",
  },
  "Low-Medium": {
    title: "Explore quick wins",
    message:
      "This area may benefit from practical, low-complexity illustrative AI opportunities.",
    suggestedActions: [
      "Launch a short enablement session",
      "Provide simple prompt examples for representative steps",
      "Monitor measured active users over the next month",
    ],
    expectedImpact: "Medium",
    investmentType: "Custom Assistant",
  },
  "Medium-Medium": {
    title: "Deepen adoption with structured enablement",
    message:
      "Moderate measured adoption and simulated AI potential suggest room to expand usage through guided enablement and clearer illustrative opportunity ownership.",
    suggestedActions: [
      "Map top 3 representative steps to AI tools",
      "Run peer-learning sessions with active users",
      "Set an 8-week measured adoption target with the department lead",
      "Review credits intensity monthly",
    ],
    expectedImpact: "Medium",
    investmentType: "Training",
  },
  "High-Medium": {
    title: "Standardize and extend observed patterns",
    message:
      "Strong measured adoption with medium simulated AI potential — consolidate what works and expand to adjacent illustrative steps.",
    suggestedActions: [
      "Document winning prompt patterns from power users",
      "Extend provisioning to remaining employees",
      "Plan to align tool usage with process KPIs when workflow data exists",
      "Benchmark against higher-potential departments",
    ],
    expectedImpact: "Medium",
    investmentType: "Process Redesign",
  },
  "Low-Low": {
    title: "Monitor and reassess fit",
    message:
      "Limited measured adoption and simulated AI potential suggest a watch-and-learn posture before committing significant investment.",
    suggestedActions: [
      "Review adoption monthly without immediate intervention",
      "Run lightweight interviews with non-active employees",
      "Revisit when business context or provisioning changes",
      "Keep in the next quarterly portfolio review",
    ],
    expectedImpact: "Low",
    investmentType: "Governance",
  },
  "Medium-Low": {
    title: "Light-touch enablement",
    message:
      "Usage is spreading but AI intensity remains low. Focus on awareness and low-friction entry points.",
    suggestedActions: [
      "Share department-level usage benchmarks",
      "Offer office hours for first-time users",
      "Pilot one low-risk illustrative assistant opportunity",
      "Track session growth over 4 weeks",
    ],
    expectedImpact: "Low",
    investmentType: "Training",
  },
  "High-Low": {
    title: "Optimize usage quality",
    message:
      "Many employees are active but credit intensity is low. Shift from access to depth of use.",
    suggestedActions: [
      "Identify steps where credits per session are highest",
      "Coach occasional users on higher-value prompts",
      "Review tool-tier mix for the department",
      "Set a credits-per-active-user improvement target",
    ],
    expectedImpact: "Low",
    investmentType: "Governance",
  },
}

function computeTrend(series, valueKey) {
  if (!series?.length || series.length < 2) return "Stable"
  const mid = Math.floor(series.length / 2)
  const first = series.slice(0, mid)
  const second = series.slice(mid)
  const avg = (arr) => arr.reduce((s, x) => s + (x[valueKey] || 0), 0) / Math.max(arr.length, 1)
  const a1 = avg(first)
  const a2 = avg(second)
  if (a1 === 0 && a2 > 0) return "Growing"
  if (a1 === 0) return "Stable"
  const ratio = a2 / a1
  if (ratio >= 1.15) return "Growing"
  if (ratio <= 0.85) return "Declining"
  return "Stable"
}

function departmentSizeTier(total) {
  if (total >= 150) return "Large"
  if (total >= 50) return "Medium"
  return "Small"
}

function intensityTier(avgCredits) {
  if (avgCredits >= 1500) return "High"
  if (avgCredits >= 600) return "Medium"
  return "Low"
}

function trendNarrative(sessionsTrend, creditsTrend) {
  const parts = []
  if (sessionsTrend === "Growing") parts.push("Sessions are trending up")
  if (sessionsTrend === "Declining") parts.push("Sessions are declining — investigate barriers before scaling investment")
  if (creditsTrend === "Growing") parts.push("credits usage is growing, supporting a faster rollout timeline")
  if (creditsTrend === "Declining") parts.push("credits usage is softening — validate tool fit and awareness")
  if (!parts.length) return null
  return parts.join("; ") + "."
}

function sizeNarrative(tier, total) {
  if (tier === "Large") {
    return `With ${total.toLocaleString()} employees, even small measured adoption gains could translate to significant organisation-wide opportunity (simulated).`
  }
  if (tier === "Small") {
    return `A compact team of ${total} allows for hands-on coaching and rapid iteration.`
  }
  return null
}

function adjustImpact(base, { sessionsTrend, creditsTrend, sizeTier, intensity }) {
  let score = base === "High" ? 3 : base === "Medium" ? 2 : 1
  if (sessionsTrend === "Growing") score += 0.5
  if (creditsTrend === "Growing") score += 0.5
  if (sessionsTrend === "Declining") score -= 0.5
  if (sizeTier === "Large" && base !== "Low") score += 0.25
  if (intensity === "High") score += 0.25
  if (score >= 3) return "High"
  if (score >= 2) return "Medium"
  return "Low"
}

export function generateProcessRecommendation(map, scenario = null) {
  const adoptionLevel = map.adoption_level
  const aiPotential = scenario?.ai_potential ?? map.ai_potential
  const investmentPriority = scenario?.management_action ?? map.management_action

  const trendSeries = map.weekly_active_users_trend
  const sessionsKey = trendSeries?.some((w) => w.sessions > 0) ? "sessions" : "active_users"
  const sessionsTrend = computeTrend(trendSeries, sessionsKey)
  const creditsTrend = computeTrend(map.weekly_credits_trend, "credits")
  const sizeTier = departmentSizeTier(map.total_employees)
  const intensity = intensityTier(map.avg_credits_per_active_user)

  const ruleKey = `${adoptionLevel}-${aiPotential}`
  const rule = RULES[ruleKey] || RULES["Low-Low"]

  const trendNote = trendNarrative(sessionsTrend, creditsTrend)
  const sizeNote = sizeNarrative(sizeTier, map.total_employees)

  const message = [rule.message, trendNote, sizeNote].filter(Boolean).join(" ")

  const expectedImpact = adjustImpact(rule.expectedImpact, {
    sessionsTrend,
    creditsTrend,
    sizeTier,
    intensity,
  })

  const recommendedInvestmentType =
    INVESTMENT_BY_ACTION[investmentPriority] || rule.investmentType

  let suggestedActions = [...rule.suggestedActions]
  if (intensity === "High" && adoptionLevel !== "High") {
    suggestedActions.push("Leverage high-intensity active users as mentors")
  }
  if (sizeTier === "Large" && investmentPriority === "Scale") {
    suggestedActions.push("Coordinate rollout waves by sub-team to manage change load")
  }

  return {
    title: rule.title,
    message,
    suggestedActions,
    priority: PRIORITY_BY_ACTION[investmentPriority] || "P3 — Medium",
    investmentPriority,
    expectedImpact,
    suggestedOwner: OWNER_BY_ACTION[investmentPriority] || OWNER_BY_ACTION.Monitor,
    recommendedInvestmentType,
    kpiToMonitor: KPI_BY_ACTION[investmentPriority] || KPI_BY_ACTION.Monitor,
    signals: {
      adoptionRate: map.adoption_rate,
      adoptionLevel,
      aiPotential,
      sessionsTrend,
      creditsTrend,
      departmentSize: sizeTier,
      avgCreditsPerActiveUser: map.avg_credits_per_active_user,
      intensity,
    },
  }
}
