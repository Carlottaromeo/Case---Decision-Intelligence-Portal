import { useCallback, useState } from "react"
import {
  normalizeDepartmentName,
  normalizeSeniority,
} from "../../scripts/dept-normalize.mjs"
import { DATA_TIERS } from "./dashboardCopy"

export const UNKNOWN_DEPARTMENT = "Unknown"
export const STORAGE_KEY = "northstar-process-filters"

export const ADOPTION_LEVELS = ["High", "Medium", "Low"]

export const INVESTMENT_PRIORITIES = ["Scale", "Industrialize", "Activate", "Quick win", "Monitor"]

export const DATA_TIER_FILTER_OPTIONS = [
  DATA_TIERS.measured.label,
  DATA_TIERS.simulated.label,
  DATA_TIERS.future.label,
]

const DEFAULT_FILTERS = {
  dateFrom: null,
  dateTo: null,
  department: null,
  seniority: null,
  adoptionLevel: null,
  investmentPriority: null,
  dataTier: null,
}

export function normalizeDepartment(value) {
  return normalizeDepartmentName(value)
}

export function normalizeSeniorityValue(value) {
  return normalizeSeniority(value)
}

export function matchDepartment(recordDept, filterDept) {
  if (!filterDept) return true
  return normalizeDepartment(recordDept) === normalizeDepartment(filterDept)
}

export function matchSeniority(recordSeniority, filterSeniority) {
  if (!filterSeniority) return true
  return normalizeSeniorityValue(recordSeniority) === normalizeSeniorityValue(filterSeniority)
}

export function getDefaultProcessFilters(processWeeks) {
  if (!processWeeks?.length) return { ...DEFAULT_FILTERS }
  return {
    ...DEFAULT_FILTERS,
    dateFrom: processWeeks[0].week_start,
    dateTo: processWeeks[processWeeks.length - 1].week_start,
  }
}

export function loadStoredProcessFilters(processWeeks) {
  const defaults = getDefaultProcessFilters(processWeeks)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const stored = JSON.parse(raw)
    return { ...defaults, ...stored }
  } catch {
    return defaults
  }
}

export function saveProcessFilters(filters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch {
    /* ignore */
  }
}

/** Apply data-tier rules without changing measured inputs. */
export function resolveActiveFilters(filters) {
  if (!filters) return { ...DEFAULT_FILTERS }
  const tier = filters.dataTier
  if (tier === DATA_TIERS.measured.label) {
    return { ...filters, investmentPriority: null }
  }
  if (tier === DATA_TIERS.future.label) {
    return { ...filters }
  }
  return { ...filters }
}

export function isFutureReadyFilter(filters) {
  return filters?.dataTier === DATA_TIERS.future.label
}

export function filterInvestmentPortfolio(items, filters) {
  const active = resolveActiveFilters(filters)
  return items.filter((item) => {
    if (!matchDepartment(item.department, active.department)) return false
    if (active.investmentPriority && item.investment_priority !== active.investmentPriority) return false
    if (active.adoptionLevel && item.adoption_level !== active.adoptionLevel) return false
    return true
  })
}

export function filterActionPlans(plans, filters) {
  const active = resolveActiveFilters(filters)
  return plans.filter((plan) => {
    if (!matchDepartment(plan.department, active.department)) return false
    if (active.investmentPriority && plan.investment_priority !== active.investmentPriority) return false
    return true
  })
}

export function useProcessFilters(processWeeks) {
  const [filters, setFiltersState] = useState(() => loadStoredProcessFilters(processWeeks))

  const setFilters = useCallback((next) => {
    setFiltersState((prev) => {
      const merged = typeof next === "function" ? next(prev) : next
      saveProcessFilters(merged)
      return merged
    })
  }, [])

  return [filters, setFilters]
}
