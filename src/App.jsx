import { useState, useCallback, useEffect, useMemo } from "react"
import { LOCALE } from "./theme"
import { DATA_TIERS, PRODUCT_PERIOD } from "./data/dashboardCopy"
import { useMeasuredData } from "./context/DashboardDataContext"
import AttentionNotifications from "./components/AttentionPoint"
import {
  DEFAULT_SECTION,
  DEFAULT_PAGES,
  getBreadcrumbs,
  getPage,
  getSection,
  getProcessBreadcrumbs,
  resolveBreadcrumbAction,
  PROCESS_RESET,
} from "./data/navStructure"
import AppSidebar from "./components/layout/AppSidebar"
import LoginGate from "./components/layout/LoginGate"
import { PageHeader } from "./components/layout/Breadcrumbs"
import { useSession } from "./context/SessionContext"
import Panoramica from "./components/Panoramica"
import AdoptionAnalytics from "./components/AdoptionAnalytics"
import DataQuality from "./components/DataQuality"
import ProcessMaps from "./components/ProcessMaps"
import InvestmentPlanner from "./components/InvestmentPlanner"
import Forecasting from "./components/Forecasting"
import InsightDrawer from "./components/InsightDrawer"
import { CONTRACT_RISK_WORKFLOW } from "./data/contractRiskWorkflow"

const WORKFLOW_TITLES = {
  "contract-risk-assessment": CONTRACT_RISK_WORKFLOW.title,
}

function PageContent({ sectionId, pageId, processNav, onProcessNavChange, onOpenInsights, onNavigate }) {
  switch (sectionId) {
    case "cockpit":
      if (pageId === "adoption-analytics") {
        return <AdoptionAnalytics onOpenInsights={onOpenInsights} />
      }
      if (pageId === "data-quality") {
        return <DataQuality />
      }
      return <Panoramica onOpenInsights={onOpenInsights} onNavigate={onNavigate} />
    case "process":
      return (
        <ProcessMaps
          nav={processNav}
          onNavChange={onProcessNavChange}
        />
      )
    case "investment":
      return <InvestmentPlanner onNavigate={onNavigate} />
    case "forecasting":
      return <Forecasting view={pageId} />
    default:
      return null
  }
}

function getProcessHeader(processNav) {
  if (processNav.view === "workflow" && processNav.workflowId) {
    return {
      title: WORKFLOW_TITLES[processNav.workflowId] ?? "Workflow",
      subtitle: CONTRACT_RISK_WORKFLOW.subtitle,
    }
  }
  if (processNav.view === "bu" && processNav.dept) {
    return {
      title: processNav.dept,
      subtitle: "Adoption snapshot and workflow opportunities",
    }
  }
  return {
    title: "Business units",
    subtitle: "Select a department to explore adoption and workflows",
  }
}

export default function App() {
  const { KPIs, loading: dataLoading } = useMeasuredData()
  const { isAuthenticated, logout } = useSession()
  const [sectionId, setSectionId] = useState(DEFAULT_SECTION)
  const [pages, setPages] = useState({ ...DEFAULT_PAGES })
  const [processNav, setProcessNav] = useState(PROCESS_RESET)
  const [insightPanel, setInsightPanel] = useState(null)
  const [pendingAnchor, setPendingAnchor] = useState(null)

  const activeSectionId = getSection(sectionId) ? sectionId : DEFAULT_SECTION
  const rawPageId = pages[activeSectionId] ?? DEFAULT_PAGES[activeSectionId]
  const section = getSection(activeSectionId)
  const pageId = section?.pages.some((p) => p.id === rawPageId)
    ? rawPageId
    : (section?.pages[0]?.id ?? rawPageId)
  const page = getPage(activeSectionId, pageId)

  const breadcrumbs = useMemo(() => {
    if (activeSectionId === "process") {
      const wfTitle = processNav.workflowId
        ? WORKFLOW_TITLES[processNav.workflowId]
        : null
      return getProcessBreadcrumbs(processNav, wfTitle)
    }
    return getBreadcrumbs(activeSectionId, pageId)
  }, [activeSectionId, pageId, processNav])

  const singlePageSection = (section?.pages.length ?? 0) === 1

  const headerTitle = activeSectionId === "process"
    ? getProcessHeader(processNav).title
    : (singlePageSection ? section?.label : (page?.label ?? section?.label))

  const headerSubtitle = activeSectionId === "process"
    ? getProcessHeader(processNav).subtitle
    : (singlePageSection ? section?.question : (page?.question ?? section?.question))

  const openInsights = useCallback((panel) => setInsightPanel(panel), [])
  const closeInsights = useCallback(() => setInsightPanel(null), [])

  const handleSectionChange = useCallback((id) => {
    setSectionId(id)
    setProcessNav(PROCESS_RESET)
  }, [])

  const handlePageChange = useCallback((id) => {
    setPages((prev) => ({ ...prev, [activeSectionId]: id }))
    if (activeSectionId === "process") setProcessNav(PROCESS_RESET)
  }, [activeSectionId])

  const handleProcessNavChange = useCallback((next) => {
    setProcessNav((prev) => ({ ...prev, ...next }))
  }, [])

  const handleBreadcrumbNavigate = useCallback((item) => {
    const resolved = resolveBreadcrumbAction(item.onClick, processNav, item)
    if (!resolved) return

    if (resolved.sectionId) {
      setSectionId(resolved.sectionId)
      setPages((prev) => ({ ...prev, [resolved.sectionId]: resolved.pageId }))
    }
    if (resolved.processNav) {
      setProcessNav(resolved.processNav)
    }
  }, [processNav])

  const handleNavigate = useCallback(({ sectionId: nextSection, pageId: nextPage, anchor, processNav: nextProcessNav }) => {
    setSectionId(nextSection)
    setPages((prev) => ({ ...prev, [nextSection]: nextPage }))
    if (nextProcessNav) {
      setProcessNav(nextProcessNav)
    } else if (nextSection !== "process") {
      setProcessNav(PROCESS_RESET)
    }
    if (anchor) setPendingAnchor(anchor)
  }, [])

  useEffect(() => {
    if (!pendingAnchor) return
    const scrollToAnchor = () => {
      const el = document.getElementById(pendingAnchor)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
        setPendingAnchor(null)
        return true
      }
      return false
    }
    if (scrollToAnchor()) return
    const timer = setTimeout(scrollToAnchor, 120)
    return () => clearTimeout(timer)
  }, [activeSectionId, pageId, pendingAnchor])

  if (!isAuthenticated) {
    return <LoginGate />
  }

  return (
    <div className="app-layout">
      <AppSidebar
        activeSection={activeSectionId}
        activePage={pageId}
        onSectionChange={handleSectionChange}
        onPageChange={handlePageChange}
        onLogout={logout}
      />

      <div className="app-workspace">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title={headerTitle}
          subtitle={headerSubtitle}
          onBreadcrumbNavigate={handleBreadcrumbNavigate}
          stats={activeSectionId === "cockpit" && pageId === "overview-trends" ? [
            { label: "Weeks", value: KPIs.weeks },
            { label: "Employees", value: KPIs.total_employees.toLocaleString(LOCALE) },
            { label: "Credits used", value: KPIs.total_credits.toLocaleString(LOCALE) },
          ] : undefined}
        />

        <div className="app-content-scroll">
          <main className="app-main">
            {dataLoading ? (
              <div className="dq-loading">Loading source files…</div>
            ) : (
              <PageContent
                sectionId={activeSectionId}
                pageId={pageId}
                processNav={processNav}
                onProcessNavChange={handleProcessNavChange}
                onOpenInsights={openInsights}
                onNavigate={handleNavigate}
              />
            )}
          </main>

          <footer className="app-footer">
            {DATA_TIERS.measured.label} = usage data · {DATA_TIERS.simulated.label} = simulated views · {PRODUCT_PERIOD}
          </footer>
        </div>
      </div>

      <AttentionNotifications onNavigate={handleNavigate} />
      <InsightDrawer panel={insightPanel} onClose={closeInsights} />
    </div>
  )
}
