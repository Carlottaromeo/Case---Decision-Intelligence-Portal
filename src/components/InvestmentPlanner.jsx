import { useMemo, useState } from "react"
import { useMeasuredData } from "../context/DashboardDataContext"
import { computeProcessMetrics, listDepartmentOptions, listSeniorityOptions } from "../data/computeProcessMetrics"
import {
  buildInvestmentPortfolio,
  rankInvestmentPortfolio,
  INVESTMENT_MATRIX_NOTE,
} from "../data/investmentPlanner"
import { enrichPortfolioWithCoach, buildWorkflowCoach } from "../data/investmentAiCoach"
import { useProcessFilters } from "../data/processFilters"
import { tierGuideBullets } from "../data/dashboardCopy"
import { exportInvestmentExcel, exportInvestmentPdf } from "../utils/investmentExport"
import ExportShareBar from "./ExportShareBar"
import { SH, PillToggle } from "./UI"
import CardActionBar from "./CardActionBar"
import { ACTION_BAR_OFFSET } from "./cardActions"
import InvestmentPriorityHero from "./investment/InvestmentPriorityHero"
import InvestmentLanes from "./investment/InvestmentLanes"
import InvestmentScatter from "./investment/InvestmentScatter"
import InvestmentCoachPanel from "./investment/InvestmentCoachPanel"
import InvestmentWorkflowDetail from "./investment/InvestmentWorkflowDetail"
import { WorkflowCoachPanel } from "./investment/InvestmentCoachPanel"
import ProcessFilters from "./process/ProcessFilters"

export default function InvestmentPlanner({ onNavigate }) {
  const { EMPLOYEE_ROSTER, USAGE_RECORDS, PROCESS_WEEKS, DEPT_COLORS } = useMeasuredData()
  const [filters, setFilters] = useProcessFilters(PROCESS_WEEKS)
  const [selectedDept, setSelectedDept] = useState(null)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null)
  const [matrixView, setMatrixView] = useState("lanes")

  const MATRIX_VIEWS = [
    ["lanes", "Priority lanes"],
    ["scatter", "Scatter plot"],
  ]

  const seniorities = useMemo(() => listSeniorityOptions(EMPLOYEE_ROSTER), [EMPLOYEE_ROSTER])
  const departments = useMemo(() => listDepartmentOptions(EMPLOYEE_ROSTER), [EMPLOYEE_ROSTER])

  const investmentFilters = useMemo(
    () => ({ ...filters, dataTier: null }),
    [filters]
  )

  const processMaps = useMemo(
    () => computeProcessMetrics(EMPLOYEE_ROSTER, USAGE_RECORDS, PROCESS_WEEKS, DEPT_COLORS, investmentFilters),
    [EMPLOYEE_ROSTER, USAGE_RECORDS, PROCESS_WEEKS, DEPT_COLORS, investmentFilters]
  )

  const portfolio = useMemo(() => {
    const base = buildInvestmentPortfolio(processMaps)
    return enrichPortfolioWithCoach(base, processMaps)
  }, [processMaps])

  const ranked = useMemo(() => rankInvestmentPortfolio(portfolio), [portfolio])
  const topThree = ranked.slice(0, 3)

  const activeDept = selectedDept ?? ranked[0] ?? null
  const selectedWorkflow = activeDept?.workflows?.find((w) => w.id === selectedWorkflowId) ?? null

  const deptCoach = activeDept?.coach ?? null
  const workflowCoach = selectedWorkflow
    ? buildWorkflowCoach(selectedWorkflow, activeDept)
    : null

  const handleSelectDept = (item) => {
    setSelectedDept(item)
    setSelectedWorkflowId(null)
  }

  const exportMeta = useMemo(() => ({ filters: investmentFilters }), [investmentFilters])

  const filtersBar = (
    <div className="investment-filters-section">
      <div className="investment-filters-section__toolbar">
        <ExportShareBar
          variant="investment"
          share={{
            title: "Investment Planner",
            text: "AI investment priorities by department",
          }}
          formats={[
            {
              key: "pdf",
              label: "PDF",
              onSelect: () => exportInvestmentPdf(ranked, exportMeta),
            },
            {
              key: "excel",
              label: "Excel",
              onSelect: () => exportInvestmentExcel(ranked, exportMeta),
            },
          ]}
        />
      </div>
      <ProcessFilters
        filters={filters}
        onChange={setFilters}
        processWeeks={PROCESS_WEEKS}
        departments={departments}
        seniorities={seniorities}
        variant="compact"
        showDataTier={false}
      />
    </div>
  )

  return (
    <div className="investment-page">
      {filtersBar}

      <InvestmentPriorityHero
        topItems={topThree}
        onSelect={handleSelectDept}
        onNavigate={onNavigate}
      />

      <div className="glass-panel investment-matrix-panel">
        <CardActionBar
          info={{
            title: "How to read the matrix",
            items: [
              INVESTMENT_MATRIX_NOTE,
              ...tierGuideBullets().slice(0, 4),
              "Use Export (PDF or Excel) for the full summary table (departments + workflows). Coach texts are rule-based AI summaries.",
            ],
          }}
        />
        <div className="investment-matrix-panel__head">
          <div style={{ paddingRight: ACTION_BAR_OFFSET, flex: 1, minWidth: 0 }}>
            <SH
              title="Investment matrix by priority"
              sub={
                matrixView === "lanes"
                  ? `${portfolio.length} departments · lane per management action`
                  : `${portfolio.length} departments · adoption rate vs AI potential`
              }
            />
          </div>
          <PillToggle options={MATRIX_VIEWS} value={matrixView} onChange={setMatrixView} />
        </div>

        {matrixView === "lanes" ? (
          <InvestmentLanes
            items={portfolio}
            selectedId={activeDept?.id}
            onSelect={handleSelectDept}
          />
        ) : (
          <InvestmentScatter
            items={portfolio}
            selectedId={activeDept?.id}
            onSelect={handleSelectDept}
          />
        )}
      </div>

      {activeDept && (
        <div className="investment-detail-grid">
          <InvestmentWorkflowDetail
            item={activeDept}
            selectedWorkflowId={selectedWorkflowId}
            onSelectWorkflow={(wf) => setSelectedWorkflowId(wf.id)}
            onNavigate={onNavigate}
          />
          {selectedWorkflow ? (
            <WorkflowCoachPanel
              workflow={selectedWorkflow}
              deptItem={activeDept}
              coach={workflowCoach}
            />
          ) : (
            <InvestmentCoachPanel
              coach={deptCoach}
              title={`Coach — ${activeDept.department}`}
            />
          )}
        </div>
      )}
    </div>
  )
}
