import { useMemo } from "react"
import {
  EMPLOYEE_ROSTER,
  USAGE_RECORDS,
  PROCESS_WEEKS,
  DEPT_COLORS,
} from "../data/data"
import { computeProcessMetrics, listDepartmentOptions, listSeniorityOptions } from "../data/computeProcessMetrics"
import { useProcessFilters } from "../data/processFilters"
import { generateProcessRecommendation } from "../data/generateProcessRecommendation"
import { C } from "../theme"
import { SH } from "./UI"
import NotificationBanner from "./NotificationBanner"
import CardActionBar from "./CardActionBar"
import { ACTION_BAR_OFFSET } from "./cardActions"
import { tierSectionNote } from "../data/dashboardCopy"
import ProcessFilters from "./process/ProcessFilters"
import ProcessAiRecommendations from "./process/ProcessAiRecommendations"

export default function AiRecommendations() {
  const [filters, setFilters] = useProcessFilters(PROCESS_WEEKS)

  const seniorities = useMemo(() => listSeniorityOptions(EMPLOYEE_ROSTER), [])
  const departments = useMemo(() => listDepartmentOptions(EMPLOYEE_ROSTER), [])

  const processMaps = useMemo(
    () => computeProcessMetrics(EMPLOYEE_ROSTER, USAGE_RECORDS, PROCESS_WEEKS, DEPT_COLORS, filters),
    [filters]
  )

  const items = useMemo(
    () => processMaps.map((map) => ({
      map,
      recommendation: generateProcessRecommendation(map),
    })),
    [processMaps]
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <NotificationBanner
        type="info"
        message="Simulated recommendations per representative process — derived from measured adoption and assumption-based process mapping. Open a process in AI Opportunity Process Maps for step-level detail."
      />

      <ProcessFilters
        filters={filters}
        onChange={setFilters}
        processWeeks={PROCESS_WEEKS}
        departments={departments}
        seniorities={seniorities}
        variant="compact"
      />

      <div className="glass-panel" style={{ position: "relative", borderRadius: 20, padding: "20px 24px" }}>
        <CardActionBar
          info={{
            title: "How to read AI recommendations",
            items: [
              tierSectionNote("simulated"),
              "One recommendation set per representative process, ranked by investment priority.",
              "Measured signals include adoption rate, credits trend, and department size.",
              "Filters are shared with AI Opportunity Process Maps, Investment Planner, and Action Plan Tracker.",
            ],
          }}
        />
        <div style={{ paddingRight: ACTION_BAR_OFFSET, marginBottom: 16 }}>
          <SH
            title="Portfolio recommendations"
            sub={`${items.length} representative processes · simulated priorities`}
          />
        </div>

        {items.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>No recommendations match the current filters.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {items.map(({ map, recommendation }) => (
              <div key={map.department}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  {map.process_name}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{map.department}</div>
                <ProcessAiRecommendations recommendation={recommendation} compact />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
