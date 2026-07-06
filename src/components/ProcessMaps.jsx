import { useMemo } from "react"
import { useMeasuredData } from "../context/DashboardDataContext"
import { CONTRACT_RISK_WORKFLOW } from "../data/contractRiskWorkflow"
import ProcessPortfolio from "./process/ProcessPortfolio"
import ProcessBuDetail from "./process/ProcessBuDetail"
import WorkflowCanvas from "./process/WorkflowCanvas"

const WORKFLOW_DATA = {
  "contract-risk-assessment": CONTRACT_RISK_WORKFLOW,
}

export default function ProcessMaps({ nav, onNavChange }) {
  const { DEPT, USAGE_RECORDS, EMPLOYEE_ROSTER, loading } = useMeasuredData()

  const deptRow = useMemo(
    () => DEPT?.find((d) => d.d === nav.dept) ?? null,
    [DEPT, nav.dept]
  )

  if (loading) {
    return <div className="dq-loading">Loading source files…</div>
  }

  if (nav.view === "workflow" && nav.workflowId) {
    const workflow = WORKFLOW_DATA[nav.workflowId]
    if (workflow) {
      return (
        <WorkflowCanvas
          workflow={workflow}
          department={nav.dept ?? workflow.department}
          employeeRoster={EMPLOYEE_ROSTER ?? []}
          usageRecords={USAGE_RECORDS ?? []}
          onClose={() => onNavChange({ view: "bu", workflowId: null })}
        />
      )
    }
  }

  if (nav.view === "bu" && nav.dept) {
    return (
      <ProcessBuDetail
        department={nav.dept}
        deptRow={deptRow}
        usageRecords={USAGE_RECORDS ?? []}
        employeeRoster={EMPLOYEE_ROSTER ?? []}
        onOpenWorkflow={(id) => onNavChange({ view: "workflow", workflowId: id })}
      />
    )
  }

  return (
    <ProcessPortfolio
      onSelectDept={(dept) => onNavChange({ view: "bu", dept, workflowId: null })}
    />
  )
}
