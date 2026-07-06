import { LOCALE } from "../theme"

function dept(depts, name) {
  return depts?.find((d) => d.d === name)
}

function toolMixLine(d) {
  if (!d) return null
  return `${d.d}: ${d.chat}% Chat, ${d.excel}% Excel, ${d.coding}% Coding IDE`
}

function intensityLine(d) {
  if (!d) return null
  return `${d.d}: ${d.cr_week} cr/user/week at ${d.prov_rate}% provisioning (${d.provisioned} of ${d.total})`
}

/** Rebuild insight evidence strings from live measured aggregates (directory + usage export). */
export function enrichInsightsWithMeasured(insights, measured) {
  if (!measured?.DEPT?.length || !insights?.length) return insights

  const { DEPT, KPIs, WEEKLY, USER_SEGMENTS } = measured
  const week1 = WEEKLY?.[0]
  const weekLast = WEEKLY?.[WEEKLY.length - 1]
  const power = USER_SEGMENTS?.find((s) => s.segment === "Power User")?.count ?? 0
  const inactive = USER_SEGMENTS?.find((s) => s.segment === "Inactive")?.count ?? 0
  const provRate = KPIs?.provisioning_rate ?? 0
  const totalEmp = KPIs?.total_employees ?? 0
  const provisioned = KPIs?.provisioned ?? 0

  return insights.map((insight) => {
    switch (insight.id) {
      case "tool-mix-coherence": {
        const names = ["Technology", "Finance", "Customer Support", "Data & Analytics"]
        const lines = names.map((n) => toolMixLine(dept(DEPT, n))).filter(Boolean)
        const da = dept(DEPT, "Data & Analytics")
        if (da) lines.push(`${da.d}: analytical profile (${da.chat}% Chat / ${da.excel}% Excel / ${da.coding}% Coding)`)
        return lines.length ? { ...insight, evidence: lines } : insight
      }
      case "consistent-growth": {
        if (!week1 || !weekLast) return insight
        return {
          ...insight,
          observation: `Weekly credit consumption rose from ${week1.credits.toLocaleString(LOCALE)} in week 1 to ${weekLast.credits.toLocaleString(LOCALE)} in week ${WEEKLY.length} — a ${KPIs.growth_pct}% increase with no week-on-week decline across the observation period.`,
          evidence: [
            `Week 1: ${week1.credits.toLocaleString(LOCALE)} credits`,
            `Week ${WEEKLY.length}: ${weekLast.credits.toLocaleString(LOCALE)} credits`,
            `Observed growth: +${KPIs.growth_pct}% credits (usage export)`,
            `Sessions week 1→${WEEKLY.length}: ${week1.sessions?.toLocaleString(LOCALE)} → ${weekLast.sessions?.toLocaleString(LOCALE)}`,
          ],
        }
      }
      case "high-consumption-signal":
        return {
          ...insight,
          observation: `${KPIs.high_consumption_users} users consumed ≥500 credits in at least one week. This concentration at the top of the distribution is statistically notable but semantically ambiguous — it cannot be read as purely positive or negative from credits alone.`,
          evidence: [
            `${KPIs.high_consumption_users} users hit ≥500 credits in at least one week (usage export)`,
            ...insight.evidence.slice(1),
          ],
        }
      case "high-intensity-incomplete-rollout": {
        const lines = ["Technology", "Data & Analytics", "Finance", "Customer Support"]
          .map((n) => intensityLine(dept(DEPT, n)))
          .filter(Boolean)
        return lines.length ? { ...insight, evidence: lines } : insight
      }
      case "low-adoption-unknown-cause": {
        const low = [...DEPT]
          .filter((d) => d.d !== "Unknown")
          .sort((a, b) => a.prov_rate - b.prov_rate)
          .slice(0, 3)
        const lines = low.map(
          (d) =>
            `${d.d}: ${d.prov_rate}% provisioned (${d.provisioned} of ${d.total}), ${d.cr_week} cr/user/week`
        )
        if (lines.length) lines.push("Same symptom (low access), different plausible root causes — data alone cannot distinguish them")
        return lines.length ? { ...insight, evidence: lines } : insight
      }
      case "gap-is-access-not-motivation": {
        const gap = totalEmp - provisioned
        return {
          ...insight,
          evidence: [
            `${inactive} inactive users among ${provisioned} provisioned`,
            `${power} Power Users (${provisioned ? ((power / provisioned) * 100).toFixed(1) : 0}% of provisioned)`,
            `${gap} employees (${(100 - provRate).toFixed(1)}%) never appear in usage data — outside rollout`,
            "Tool mix coherence in active departments supports sustained, contextual usage",
          ],
        }
      }
      default:
        return insight
    }
  })
}
