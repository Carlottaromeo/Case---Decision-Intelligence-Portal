import { useMemo } from "react"
import { useMeasuredData } from "../../context/DashboardDataContext"
import { computeProcessMetrics } from "../../data/computeProcessMetrics"
import {
  buildInvestmentPortfolio,
  rankInvestmentPortfolio,
} from "../../data/investmentPlanner"
import { enrichPortfolioWithCoach } from "../../data/investmentAiCoach"
import { DATA_TIERS } from "../../data/dashboardCopy"
import { Badge } from "../UI"
import ProcessPortfolioCard from "./ProcessPortfolioCard"

export default function ProcessPortfolio({ onSelectDept }) {
  const { EMPLOYEE_ROSTER, USAGE_RECORDS, PROCESS_WEEKS, DEPT_COLORS } = useMeasuredData()

  const processMaps = useMemo(
    () =>
      computeProcessMetrics(
        EMPLOYEE_ROSTER ?? [],
        USAGE_RECORDS ?? [],
        PROCESS_WEEKS ?? [],
        DEPT_COLORS ?? {},
        { dataTier: null }
      ),
    [EMPLOYEE_ROSTER, USAGE_RECORDS, PROCESS_WEEKS, DEPT_COLORS]
  )

  const portfolio = useMemo(() => {
    const base = buildInvestmentPortfolio(processMaps)
    return enrichPortfolioWithCoach(base, processMaps)
  }, [processMaps])

  const ranked = useMemo(() => rankInvestmentPortfolio(portfolio), [portfolio])

  return (
    <div className="process-guided">
      <div className="process-guided__badge-row">
        <Badge label={DATA_TIERS.simulated.label} color={DATA_TIERS.simulated.color} />
      </div>

      <div className="process-portfolio__grid">
        {ranked.map((item) => (
          <ProcessPortfolioCard
            key={item.id}
            item={item}
            onViewWorkflows={() => onSelectDept?.(item.department)}
          />
        ))}
      </div>
    </div>
  )
}
