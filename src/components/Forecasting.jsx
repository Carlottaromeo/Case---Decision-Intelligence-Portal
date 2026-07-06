import { useMeasuredData } from "../context/DashboardDataContext"
import CostSimulator from "./forecast/CostSimulator"

export default function Forecasting({ onOpenInsights }) {
  const { DEPT, KPIs, DEPT_TOOL_TIER_CREDITS, DEPT_COLORS } = useMeasuredData()

  return (
    <CostSimulator
      deptRows={DEPT}
      deptToolTierCredits={DEPT_TOOL_TIER_CREDITS}
      kpis={KPIs}
      deptColors={DEPT_COLORS}
      onOpenInsights={onOpenInsights}
    />
  )
}
