import { useMemo } from "react"
import { useMeasuredData } from "../context/DashboardDataContext"
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
  const measured = useMeasuredData()
  const roster = measured.EMPLOYEE_ROSTER ?? []
  const usage = measured.USAGE_RECORDS ?? []
  const weeks = measured.PROCESS_WEEKS ?? []
  const colors = measured.DEPT_COLORS ?? {}

  const [filters, setFilters] = useProcessFilters(weeks)

  const seniorities = useMemo(() => listSeniorityOptions(roster), [roster])
  const departments = useMemo(() => listDepartmentOptions(roster), [roster])

  const processMaps = useMemo(
    () => computeProcessMetrics(roster, usage, weeks, colors, filters),
    [roster, usage, weeks, colors, filters]
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
        processWeeks={weeks}
        departments={departments}
        seniorities={seniorities}
        variant="compact"
      />

      <div className="glass-panel" style={{ borderRadius: 20, padding: "20px 24px", position: "relative" }}>
        <CardActionBar
          info={{
            title: "How to read recommendations",
            items: [
              tierSectionNote(),
              "Measured signals include adoption rate, credits trend, and department size.",
              "Investment priority and expected impact are simulated from the adoption × AI potential matrix.",
            ],
          }}
        />
        <div style={{ paddingRight: ACTION_BAR_OFFSET, marginBottom: 16 }}>
          <SH
            title="AI Recommendations"
            sub={`${items.length} representative processes · ranked by simulated priority`}
          />
        </div>

        {items.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>No recommendations match the current filters.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
