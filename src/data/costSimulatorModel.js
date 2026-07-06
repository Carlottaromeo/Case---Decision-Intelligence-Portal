import {
  buildParamsFromScenario,
  computeGeminiCostsByDept,
  COST_PERIOD_MONTHS,
} from "./geminiCostModel"

export const COST_FACTOR = 13 / 3
export const POOL_HEADCOUNT = 30
export const CURVE_STEPS = 21

export const SIMULATOR_CAPTION =
  "Cost roughly doubles ($4.7k → $9.5k/mo) as adoption goes to 100%, though users grow 2.7× — new users cluster in low-cost BUs. Technology is 71% of the increase (110 engineers on coding models). Same-intensity assumption. Per-user cost is fixed by each BU's tool mix; if that average changes, the whole curve shifts."

const EXCLUDED_DEPTS = new Set(["Unknown"])

function roundCost(value) {
  return Math.round(value)
}

function roundAdoptionPct(active, totalEmployees) {
  return Math.round((active / totalEmployees) * 100)
}

export function effectiveProgress(buId, pGlobal, overrides = {}) {
  if (overrides[buId] != null) return overrides[buId]
  return pGlobal
}

export function buildCostSimulatorModel(
  deptRows,
  deptToolTierCredits,
  kpis,
  scenarioKey = "central"
) {
  const params = buildParamsFromScenario(scenarioKey)
  const totalEmployees = kpis?.total_employees ?? 1233
  const provisioned = kpis?.provisioned ?? 461
  const startAdoptionPct = roundAdoptionPct(provisioned, totalEmployees)

  const visibleDepts = (deptRows ?? []).filter((d) => !EXCLUDED_DEPTS.has(d.d))
  const deptMeta = Object.fromEntries(
    visibleDepts.map((d) => [d.d, { active_users: d.active_users }])
  )

  const geminiRows = computeGeminiCostsByDept(deptToolTierCredits, deptMeta, params)
  const geminiByDept = Object.fromEntries(geminiRows.map((r) => [r.dept, r]))

  const bus = visibleDepts
    .map((d) => {
      const gemini = geminiByDept[d.d]
      const monthlyCost = gemini ? gemini.cost / COST_PERIOD_MONTHS : 0
      const active = d.active_users ?? 0
      const rate =
        active > 0 ? monthlyCost / (active * COST_FACTOR) : 0

      return {
        id: d.d,
        active,
        total: d.total ?? 0,
        rate,
        creditsPerWeek: d.cr_week ?? 0,
        monthlyAtCurrent: monthlyCost,
        monthlyAtFull: (d.total ?? 0) * rate * COST_FACTOR,
        adoptionPct: d.total > 0 ? Math.round((active / d.total) * 100) : 0,
      }
    })
    .sort((a, b) => b.monthlyAtCurrent - a.monthlyAtCurrent)

  const baselineBuMonthly = bus.reduce((sum, b) => sum + b.monthlyAtCurrent, 0)
  const fullBuMonthly = bus.reduce((sum, b) => sum + b.monthlyAtFull, 0)
  const poolRate =
    provisioned > 0 ? baselineBuMonthly / (provisioned * COST_FACTOR) : 0

  const baselineMonthly = simulateCostInternal(
    bus,
    poolRate,
    0,
    {},
    totalEmployees,
    provisioned
  )
  const fullMonthly = simulateCostInternal(
    bus,
    poolRate,
    1,
    {},
    totalEmployees,
    provisioned
  )

  return {
    bus,
    poolRate,
    totalEmployees,
    provisioned,
    startAdoptionPct,
    baselineMonthly: baselineMonthly.totalCost,
    fullMonthly: fullMonthly.totalCost,
    fullBuMonthly,
  }
}

function buActiveAtProgress(bu, progress) {
  return bu.active + progress * (bu.total - bu.active)
}

function buCostAtProgress(bu, progress) {
  return buActiveAtProgress(bu, progress) * bu.rate * COST_FACTOR
}

function simulateCostInternal(
  bus,
  poolRate,
  pGlobal,
  overrides,
  totalEmployees,
  provisioned
) {
  let buActive = 0
  let buCost = 0
  const byBu = {}

  for (const bu of bus) {
    const progress = effectiveProgress(bu.id, pGlobal, overrides)
    const active = buActiveAtProgress(bu, progress)
    const cost = buCostAtProgress(bu, progress)
    buActive += active
    buCost += cost
    byBu[bu.id] = { active, cost, progress }
  }

  const poolActive = pGlobal * POOL_HEADCOUNT
  const poolCost = poolActive * poolRate * COST_FACTOR
  const displayActive = provisioned + pGlobal * (totalEmployees - provisioned)

  return {
    buActive: Math.round(buActive),
    poolActive: Math.round(poolActive),
    displayActive: Math.round(displayActive),
    adoptionPct: roundAdoptionPct(displayActive, totalEmployees),
    buCost,
    poolCost,
    totalCost: roundCost(buCost + poolCost),
    byBu,
  }
}

export function simulateCost(model, pGlobal, overrides = {}) {
  if (!model) {
    return {
      buActive: 0,
      poolActive: 0,
      displayActive: 0,
      adoptionPct: 0,
      totalCost: 0,
      byBu: {},
    }
  }

  return simulateCostInternal(
    model.bus,
    model.poolRate,
    pGlobal,
    overrides,
    model.totalEmployees,
    model.provisioned
  )
}

export function buildCostCurve(model, { overrides = {}, isolatedBuId = null } = {}) {
  if (!model) return { total: [], bu: null }

  const total = []
  const bu = isolatedBuId ? [] : null
  const buRow = isolatedBuId ? model.bus.find((b) => b.id === isolatedBuId) : null

  for (let i = 0; i < CURVE_STEPS; i++) {
    const pGlobal = i / (CURVE_STEPS - 1)
    const snapshot = simulateCost(model, pGlobal, overrides)
    const progressPct = Math.round(pGlobal * 100)

    total.push({
      progress: progressPct,
      adoptionPct: snapshot.adoptionPct,
      totalCost: snapshot.totalCost,
    })

    if (bu && buRow) {
      const progress = effectiveProgress(isolatedBuId, pGlobal, overrides)
      bu.push({
        progress: progressPct,
        adoptionPct: buRow.total
          ? Math.round((buActiveAtProgress(buRow, progress) / buRow.total) * 100)
          : 0,
        buCost: roundCost(buCostAtProgress(buRow, progress)),
      })
    }
  }

  return { total, bu }
}

export function buBreakdown(model, pGlobal, overrides = {}) {
  if (!model) return []

  const snapshot = simulateCost(model, pGlobal, overrides)

  return model.bus.map((bu) => {
    const row = snapshot.byBu[bu.id] ?? { active: bu.active, cost: bu.monthlyAtCurrent, progress: 0 }
    return {
      ...bu,
      simulatedActive: Math.round(row.active),
      simulatedCost: roundCost(row.cost),
      effectiveProgress: row.progress,
      hasOverride: overrides[bu.id] != null,
    }
  })
}
