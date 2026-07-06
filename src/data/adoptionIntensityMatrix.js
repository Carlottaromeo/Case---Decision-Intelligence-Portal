export const DEFAULT_ADOPTION_THRESHOLD = 38
export const DEFAULT_INTENSITY_THRESHOLD = 65
export const BORDERLINE_EPSILON = 1.5

export const MATRIX_QUADRANTS = {
  champions: {
    id: "champions",
    label: "Champions",
    color: "#0A8F3E",
    fill: "#0A8F3E18",
    axes: "High adoption · High intensity",
    tooltip:
      "Widely adopted and used heavily. Sustain and harvest best practices.",
  },
  scale: {
    id: "scale",
    label: "Scale",
    color: "#D95600",
    fill: "#D9560018",
    axes: "Low adoption · High intensity",
    tooltip:
      "Few users, but they use it heavily — proven value, untapped breadth. Evangelize the rest. Highest-ROI adoption play.",
  },
  investigate: {
    id: "investigate",
    label: "Investigate",
    color: "#6229FF",
    fill: "#6229FF18",
    axes: "High adoption · Low intensity",
    tooltip:
      "Many have access but engagement is shallow. Diagnose WHY usage is low (workflow fit? enablement? wrong use cases?) before acting — a red flag, not an automatic win.",
  },
  lowfit: {
    id: "lowfit",
    label: "Low fit",
    color: "#64748B",
    fill: "#64748B18",
    axes: "Low adoption · Low intensity",
    tooltip:
      "Few adopt it and use it lightly — likely a weak fit with the work. Assess relevance; deprioritize unless strategic.",
  },
}

/** Legend order matches matrix layout: top row → bottom row, left → right. */
export const QUADRANT_LEGEND = ["scale", "champions", "lowfit", "investigate"].map(
  (id) => MATRIX_QUADRANTS[id]
)

export function classifyQuadrant(adoption, intensity, adoptionThreshold, intensityThreshold) {
  const hiAdopt = adoption >= adoptionThreshold
  const hiInt = Math.round(intensity) >= intensityThreshold
  if (hiAdopt && hiInt) return "champions"
  if (!hiAdopt && hiInt) return "scale"
  if (hiAdopt && !hiInt) return "investigate"
  return "lowfit"
}

export function isBorderline(row, adoptionThreshold, intensityThreshold, epsilon = BORDERLINE_EPSILON) {
  return (
    Math.abs(row.adoption - adoptionThreshold) <= epsilon ||
    Math.abs(row.intensity - intensityThreshold) <= epsilon
  )
}

export function buildMatrixBuRows(deptRows, weeks = 13) {
  const rows = (deptRows ?? [])
    .filter((d) => d.d && d.d !== "Unknown")
    .map((d) => {
      const active = d.active_users ?? d.provisioned ?? 0
      const total = d.total ?? 0
      const nonAdopt = Math.max(0, total - active)
      const adoption = total > 0 ? Math.round((active / total) * 1000) / 10 : 0
      const intensityRaw =
        d.cr_week ??
        (active > 0 ? d.total_credits / active / weeks : 0)
      const intensity = Math.round(intensityRaw * 10) / 10

      return {
        id: d.d,
        department: d.d,
        displayName: d.d === "Sales & Part." ? "Sales & Partnerships" : d.d,
        active,
        total,
        nonAdopt,
        adoption,
        intensity,
        credits: d.total_credits ?? 0,
        color: d.color,
      }
    })

  const minNonAdopt = Math.min(...rows.map((r) => r.nonAdopt), 0)
  const maxNonAdopt = Math.max(...rows.map((r) => r.nonAdopt), 1)

  return rows.map((row) => ({
    ...row,
    bubbleRadius: bubbleRadius(row.nonAdopt, minNonAdopt, maxNonAdopt),
  }))
}

export function applyQuadrants(rows, adoptionThreshold, intensityThreshold) {
  return rows.map((row) => {
    const quadrantId = classifyQuadrant(row.adoption, row.intensity, adoptionThreshold, intensityThreshold)
    const quadrant = MATRIX_QUADRANTS[quadrantId]
    return {
      ...row,
      quadrantId,
      quadrantLabel: quadrant.label,
      quadrantColor: quadrant.color,
      quadrantAction: quadrant.tooltip,
      borderline: isBorderline(row, adoptionThreshold, intensityThreshold),
    }
  })
}

export function bubbleRadius(nonAdopt, min, max) {
  const span = max - min || 1
  const t = (nonAdopt - min) / span
  return Math.round(10 + t * 20)
}

export function computeMatrixYMax(rows, padding = 0.12) {
  const peak = Math.max(...rows.map((r) => r.intensity), DEFAULT_INTENSITY_THRESHOLD)
  return Math.ceil((peak * (1 + padding)) / 10) * 10
}

export function buildMatrixInsights({ rows, kpis }) {
  const companyAdoption = kpis?.provisioning_rate ?? 0
  const nonAdopters = kpis?.outside_rollout ?? 0
  const topInvestigate = [...rows]
    .filter((r) => r.quadrantId === "investigate")
    .sort((a, b) => b.nonAdopt - a.nonAdopt)[0]

  return [
    `Company adoption is ${Math.round(companyAdoption)}% — ${nonAdopters.toLocaleString("en-US")} non-adopters. This matrix decides where to push adoption first.`,
    topInvestigate
      ? `Adoption axis is the penetration RATE; bubble size is the ABSOLUTE gap. ${topInvestigate.displayName} reads as high-adoption (${topInvestigate.adoption}%) but has the biggest bubble (${topInvestigate.nonAdopt} untapped) AND shallow usage — hence '${topInvestigate.quadrantLabel}', not a quick win.`
      : "Adoption axis is the penetration RATE; bubble size is the ABSOLUTE gap — large bubbles with shallow intensity warrant investigation, not a quick win.",
    "Y axis is per-active-user, not total credits: Customer Support has the 2nd-highest total volume but low per-user intensity — it's big, not intensive.",
    "Heavy tail: in Technology the top 20% of users drive ~52% of usage — high average intensity can hide a few power users, especially in small BUs (People: 6 active).",
    "Moving target: per-user usage rose 43→158/week over the dataset — bubbles drift up-right over time. This is a snapshot.",
  ]
}
