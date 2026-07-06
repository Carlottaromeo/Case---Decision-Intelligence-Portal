import { DEPT_SOURCE_FILES } from "./dashboardCopy"

export const SOURCE_FILE_IDS = {
  directory: "directory",
  usage: "usage",
}

export const SOURCE_FILES = {
  [SOURCE_FILE_IDS.directory]: {
    id: SOURCE_FILE_IDS.directory,
    label: "Employee directory",
    filename: DEPT_SOURCE_FILES.directory,
    type: "xlsx",
    publicPath: `/${DEPT_SOURCE_FILES.directory}`,
    description: "Who exists and their business unit (1,233 employees).",
  },
  [SOURCE_FILE_IDS.usage]: {
    id: SOURCE_FILE_IDS.usage,
    label: "Usage export",
    filename: DEPT_SOURCE_FILES.usage,
    type: "csv",
    publicPath: `/${DEPT_SOURCE_FILES.usage}`,
    description: "Weekly AI credits and sessions — department joined via employee_id.",
  },
}

export const SOURCE_FILE_LIST = Object.values(SOURCE_FILES)
