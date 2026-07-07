import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { C, LOCALE } from "./theme"
import { PRODUCT_PERIOD } from "./data/dashboardCopy"
import { useMeasuredData } from "./context/DashboardDataContext"
import AttentionNotifications from "./components/AttentionPoint"
import NotificationBanner from "./components/NotificationBanner"
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
import PageHeaderActions from "./components/PageHeaderActions"
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
      if (pageId === "investment-planner") {
        return <InvestmentPlanner onOpenInsights={onOpenInsights} />
      }
      if (pageId === "forecasting") {
        return <Forecasting onOpenInsights={onOpenInsights} />
      }
      return <Panoramica onOpenInsights={onOpenInsights} onNavigate={onNavigate} />
    case "process":
      return (
        <ProcessMaps
          nav={processNav}
          onNavChange={onProcessNavChange}
        />
      )
    case "data-quality":
      return <DataQuality />
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
    title: "Process mapping",
    subtitle: "Select the department for which to create or edit processes",
  }
}

export default function App() {
  const {
    KPIs,
    loading: dataLoading,
    dataRevision,
    dataRefreshMessage,
    clearDataRefreshMessage,
  } = useMeasuredData()
  const { isAuthenticated, logout } = useSession()
  const [sectionId, setSectionId] = useState(DEFAULT_SECTION)
  const [pages, setPages] = useState({ ...DEFAULT_PAGES })
  const [processNav, setProcessNav] = useState(PROCESS_RESET)
  const [insightPanel, setInsightPanel] = useState(null)
  const [pendingAnchor, setPendingAnchor] = useState(null)
  const [headerNotice, setHeaderNotice] = useState(null)
  const contentScrollRef = useRef(null)

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
    : singlePageSection
      ? section?.label
      : (page?.label ?? section?.label)

  const headerSubtitle = activeSectionId === "process"
    ? getProcessHeader(processNav).subtitle
    : (singlePageSection ? section?.question : (page?.question ?? section?.question))

  const cockpitStats = useMemo(() => [
    { label: "Weeks", value: KPIs.weeks },
    { label: "Employees", value: KPIs.total_employees.toLocaleString(LOCALE) },
    { label: "Credits used", value: KPIs.total_credits.toLocaleString(LOCALE) },
    { label: "Active users", value: KPIs.active_users.toLocaleString(LOCALE), color: C.green },
  ], [KPIs.weeks, KPIs.total_employees, KPIs.total_credits, KPIs.active_users])

  const showCockpitStats = activeSectionId === "cockpit"
  const showHeaderActions = true

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
    if (pendingAnchor) return
    const viewport = contentScrollRef.current
    if (!viewport) return
    viewport.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [activeSectionId, pageId, processNav.view, processNav.dept, processNav.workflowId, pendingAnchor])

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
          stats={showCockpitStats ? cockpitStats : undefined}
          actions={
            showHeaderActions ? (
              <PageHeaderActions
                title={headerTitle}
                subtitle={headerSubtitle}
                kpis={cockpitStats}
                onNotify={(msg) => {
                  setHeaderNotice(msg)
                  setTimeout(() => setHeaderNotice(null), 2400)
                }}
              />
            ) : null
          }
        />

        <div className="app-content-scroll" ref={contentScrollRef}>
          {headerNotice && (
            <NotificationBanner
              type="success"
              message={headerNotice}
              onDismiss={() => setHeaderNotice(null)}
              className="app-data-refresh-banner"
            />
          )}
          {dataRefreshMessage && (
            <NotificationBanner
              type="success"
              message={dataRefreshMessage}
              onDismiss={clearDataRefreshMessage}
              className="app-data-refresh-banner"
            />
          )}
          <main className="app-main">
            {dataLoading ? (
              <div className="dq-loading">Loading source files…</div>
            ) : (
              <PageContent
                key={dataRevision}
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
            {PRODUCT_PERIOD}
          </footer>
        </div>
      </div>

      <AttentionNotifications onNavigate={handleNavigate} />
      <InsightDrawer panel={insightPanel} onClose={closeInsights} />
    </div>
  )
}
