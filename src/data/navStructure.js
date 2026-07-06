import { PRODUCT_NAME } from "./dashboardCopy"

export const APP_SECTIONS = [
  {
    id: "cockpit",
    label: "Executive View",
    iconKey: "panoramica",
    question: "How is AI adoption progressing overall?",
    pages: [
      {
        id: "overview-trends",
        label: "Overview",
        question: "How is AI adoption progressing overall?",
      },
      {
        id: "adoption-analytics",
        label: "Adoption Analytics",
        question: "Where is adoption strong or weak?",
      },
      {
        id: "investment-planner",
        label: "Investment Planner",
        question: "Where should management invest first?",
      },
    ],
  },
  {
    id: "process",
    label: "Process mapping",
    iconKey: "processmaps",
    question: "Where could AI create value in representative business processes?",
    pages: [
      { id: "portfolio", label: "Process portfolio" },
    ],
  },
  {
    id: "forecasting",
    label: "Forecasting",
    iconKey: "forecasting",
    question: "How could future AI usage evolve?",
    pages: [
      { id: "outlook", label: "Cost simulator" },
    ],
  },
  {
    id: "data-quality",
    label: "Data repository",
    iconKey: "tooltier",
    question: "How reliable is the data — and can I keep source files under control?",
    pages: [
      { id: "overview", label: "Data Quality" },
    ],
  },
]

export function getSection(sectionId) {
  return APP_SECTIONS.find((s) => s.id === sectionId)
}

export function getPage(sectionId, pageId) {
  const section = getSection(sectionId)
  return section?.pages.find((p) => p.id === pageId)
}

export function getBreadcrumbs(sectionId, pageId) {
  const section = getSection(sectionId)
  const page = getPage(sectionId, pageId)
  const singlePage = (section?.pages.length ?? 0) === 1

  const items = [
    { label: PRODUCT_NAME, id: "root", onClick: "home" },
    {
      label: section?.label ?? sectionId,
      id: sectionId,
      onClick: singlePage ? undefined : "section",
      targetSection: sectionId,
      targetPage: section?.pages[0]?.id,
      current: singlePage,
    },
  ]

  if (!singlePage) {
    items.push({ label: page?.label ?? pageId, id: pageId, current: true })
  }

  return items
}

const PROCESS_RESET = { view: "picker", dept: null, workflowId: null }

export function getProcessBreadcrumbs(processNav, workflowTitle) {
  const items = [
    { label: PRODUCT_NAME, id: "root", onClick: "home" },
    {
      label: "Process mapping",
      id: "process-section",
      onClick: "process-reset",
    },
    {
      label: "Process portfolio",
      id: "portfolio",
      onClick: processNav.view !== "picker" ? "process-reset" : undefined,
      current: processNav.view === "picker",
    },
  ]

  if (processNav.dept) {
    items[items.length - 1].current = false
    if (!processNav.workflowId) {
      items.push({
        label: processNav.dept,
        id: "dept",
        current: true,
        onClick: processNav.view === "workflow" ? "process-dept" : undefined,
      })
    } else {
      items.push({
        label: processNav.dept,
        id: "dept",
        onClick: "process-dept",
      })
      items.push({
        label: workflowTitle ?? "Workflow",
        id: "workflow",
        current: true,
      })
    }
  }

  return items
}

export function resolveBreadcrumbAction(action, processNav, item) {
  switch (action) {
    case "home":
      return { sectionId: DEFAULT_SECTION, pageId: DEFAULT_PAGES[DEFAULT_SECTION], processNav: PROCESS_RESET }
    case "section":
      return {
        sectionId: item?.targetSection ?? DEFAULT_SECTION,
        pageId: item?.targetPage ?? DEFAULT_PAGES[item?.targetSection ?? DEFAULT_SECTION],
        processNav: PROCESS_RESET,
      }
    case "process-reset":
      return { processNav: PROCESS_RESET }
    case "process-dept":
      return { processNav: { view: "bu", dept: processNav.dept, workflowId: null } }
    default:
      return null
  }
}

export { PROCESS_RESET }

export const DEFAULT_SECTION = APP_SECTIONS[0].id
export const DEFAULT_PAGES = Object.fromEntries(
  APP_SECTIONS.map((s) => [s.id, s.pages[0].id])
)
