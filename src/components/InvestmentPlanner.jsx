import { useMeasuredData } from "../context/DashboardDataContext"
import AdoptionIntensityMatrix from "./investment/AdoptionIntensityMatrix"

/** Investment Planner — title and subtitle are rendered in PageHeader via navStructure. */
export default function InvestmentPlanner({ onOpenInsights }) {
  const { DEPT, KPIs } = useMeasuredData()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <AdoptionIntensityMatrix deptRows={DEPT} kpis={KPIs} onOpenInsights={onOpenInsights} />
    </div>
  )
}
