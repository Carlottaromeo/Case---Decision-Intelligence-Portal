export const FORECAST_DISCLAIMER =
  "Forecasts are directional and based on historical MVP usage data."

export const SCENARIOS = {
  conservative: { id: "conservative", label: "Conservative", slopeFactor: 0.75, color: "D95600" },
  baseline: { id: "baseline", label: "Baseline", slopeFactor: 1, color: "6B9A00" },
  accelerated: { id: "accelerated", label: "Accelerated adoption", slopeFactor: 1.25, color: "007FA3" },
}

export const METRICS = [
  { key: "active_users", label: "Weekly active users", color: "#6B9A00" },
  { key: "sessions", label: "Weekly sessions", color: "#007FA3" },
  { key: "credits", label: "Weekly credits used", color: "#B8009E" },
]

const IMPLICATIONS = {
  conservative:
    "If usage growth slows, current license capacity may remain sufficient. Defer incremental spend and monitor weekly adoption closely.",
  baseline:
    "At the current trajectory, plan for moderate increases in credits and session volume. Review licensing tiers at the next quarterly checkpoint.",
  accelerated:
    "If the accelerated scenario materializes, AI usage capacity and licensing needs may increase significantly over the next 8 weeks.",
}

function avg(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0
}

function linearRegression(values) {
  const n = values.length
  if (n === 0) return { intercept: 0, slope: 0 }
  if (n === 1) return { intercept: values[0], slope: 0 }

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumXX += i * i
  }
  const denom = n * sumXX - sumX * sumX
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0
  const intercept = (sumY - slope * sumX) / n
  return { intercept, slope }
}

function movingAverage(values, window = 4) {
  if (values.length < window) return avg(values)
  return avg(values.slice(-window))
}

function forecastSeries(values, horizon, slopeFactor = 1) {
  const n = values.length
  if (!n) return Array(horizon).fill(0)

  const { intercept, slope } = linearRegression(values)
  const adjustedSlope = slope * slopeFactor
  const level = movingAverage(values)

  const forecasts = []
  for (let h = 1; h <= horizon; h++) {
    const linear = intercept + adjustedSlope * (n - 1 + h)
    const blended = linear * 0.6 + level * 0.4
    forecasts.push(Math.max(0, Math.round(blended)))
  }
  return forecasts
}

function computeConfidence(values) {
  const n = values.length
  if (n < 6) return "Low"

  const mean = avg(values)
  if (mean === 0) return "Low"

  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n
  const cv = Math.sqrt(variance) / mean

  const mid = Math.floor(n / 2)
  const firstAvg = avg(values.slice(0, mid))
  const secondAvg = avg(values.slice(mid))
  const trendingUp = secondAvg >= firstAvg

  if (cv < 0.28 && trendingUp && n >= 10) return "High"
  if (cv < 0.45 && n >= 8) return "Medium"
  return "Low"
}

function growthRate(lastActual, forecastEnd) {
  if (!lastActual) return forecastEnd > 0 ? 100 : 0
  return Math.round(((forecastEnd - lastActual) / lastActual) * 1000) / 10
}

function sum(arr) {
  return arr.reduce((s, v) => s + v, 0)
}

export function buildWeeklyDemandSeries(weekly, usageRecords = null) {
  const activeByWeek = new Map()
  if (usageRecords?.length) {
    for (const r of usageRecords) {
      if (r.credits > 0 || r.sessions > 0) {
        const key = r.week_label || r.week_start
        if (!activeByWeek.has(key)) activeByWeek.set(key, new Set())
        activeByWeek.get(key).add(r.employee_id)
      }
    }
  }

  return weekly.map((w) => ({
    week: w.week,
    credits: w.credits,
    sessions: w.sessions,
    active_users: w.active_users ?? activeByWeek.get(w.week)?.size ?? 0,
  }))
}

export function buildForecastModel(weeklySeries) {
  const metrics = {}
  const confidenceByMetric = {}

  for (const { key } of METRICS) {
    const values = weeklySeries.map((w) => w[key])
    confidenceByMetric[key] = computeConfidence(values)

    metrics[key] = {}
    for (const scenario of Object.values(SCENARIOS)) {
      const forecast8 = forecastSeries(values, 8, scenario.slopeFactor)
      const forecast4 = forecast8.slice(0, 4)
      const last = values[values.length - 1] || 0

      metrics[key][scenario.id] = {
        forecast4,
        forecast8,
        total4: sum(forecast4),
        total8: sum(forecast8),
        week4: forecast4[3] ?? 0,
        week8: forecast8[7] ?? 0,
        growthRate4: growthRate(last, forecast4[3] ?? 0),
        growthRate8: growthRate(last, forecast8[7] ?? 0),
      }
    }
  }

  const baselineCredits = metrics.credits?.baseline
  const overallGrowth8 = baselineCredits?.growthRate8 ?? 0
  const confidenceScores = Object.values(confidenceByMetric)
  const overallConfidence = confidenceScores.includes("Low")
    ? "Low"
    : confidenceScores.includes("Medium")
      ? "Medium"
      : "High"

  const scenarios = Object.values(SCENARIOS).map((scenario) => ({
    ...scenario,
    implication: IMPLICATIONS[scenario.id],
    active_users: {
      week4: metrics.active_users[scenario.id].week4,
      week8: metrics.active_users[scenario.id].week8,
      total4: metrics.active_users[scenario.id].total4,
      total8: metrics.active_users[scenario.id].total8,
    },
    sessions: {
      week4: metrics.sessions[scenario.id].week4,
      week8: metrics.sessions[scenario.id].week8,
      total4: metrics.sessions[scenario.id].total4,
      total8: metrics.sessions[scenario.id].total8,
    },
    credits: {
      week4: metrics.credits[scenario.id].week4,
      week8: metrics.credits[scenario.id].week8,
      total4: metrics.credits[scenario.id].total4,
      total8: metrics.credits[scenario.id].total8,
    },
    growthRate8: metrics.credits[scenario.id].growthRate8,
  }))

  return {
    weeklySeries,
    metrics,
    confidenceByMetric,
    overallGrowth8,
    overallConfidence,
    scenarios,
  }
}

export function buildChartData(weeklySeries, metricKey, scenarioId = "baseline") {
  const values = weeklySeries.map((w) => w[metricKey])
  const scenario = SCENARIOS[scenarioId] || SCENARIOS.baseline
  const forecast8 = forecastSeries(values, 8, scenario.slopeFactor)

  const actual = weeklySeries.map((w, i) => ({
    week: w.week,
    actual: w[metricKey],
    forecast: null,
    forecast4: null,
    type: "actual",
    index: i,
  }))

  const forecastPoints = forecast8.map((value, i) => ({
    week: `+${i + 1}w`,
    actual: null,
    forecast: value,
    forecast4: i < 4 ? value : null,
    type: "forecast",
    index: weeklySeries.length + i,
  }))

  const bridge = {
    week: weeklySeries[weeklySeries.length - 1]?.week || "",
    actual: values[values.length - 1],
    forecast: values[values.length - 1],
    forecast4: values[values.length - 1],
    type: "bridge",
    index: weeklySeries.length - 1,
  }

  return [...actual.slice(0, -1), bridge, ...forecastPoints]
}
