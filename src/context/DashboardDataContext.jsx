import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { SOURCE_FILE_IDS, SOURCE_FILES } from "../data/sourceFilesMeta"
import { processSourceData, directoryRowsFromXlsx } from "../data/processSourceData"
import { applySourceDataAi } from "../data/sourceDataAi"
import { parseCsvText, rowsToCsv, fetchText, fetchArrayBuffer } from "../utils/parseSourceFiles"
import {
  appendUpdateLog,
  loadStoredFile,
  loadUpdateLog,
  saveStoredFile,
} from "../utils/sourceDataStorage"
import * as staticData from "../data/data"

const DashboardDataContext = createContext(null)

function nowIso() {
  return new Date().toISOString()
}

export function DashboardDataProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [measured, setMeasured] = useState(null)
  const [directoryRows, setDirectoryRows] = useState([])
  const [directoryHeaders, setDirectoryHeaders] = useState([])
  const [usageCsvText, setUsageCsvText] = useState("")
  const [usageHeaders, setUsageHeaders] = useState([])
  const [directoryMeta, setDirectoryMeta] = useState({ updatedAt: null, source: "public" })
  const [usageMeta, setUsageMeta] = useState({ updatedAt: null, source: "public" })
  const [updateLog, setUpdateLog] = useState([])
  const [aiMessage, setAiMessage] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const refreshLog = useCallback(async () => {
    setUpdateLog(await loadUpdateLog())
  }, [])

  const applyProcessed = useCallback((processed, dirRows, headers, csv, dirMeta, useMeta) => {
    setMeasured(processed)
    setDirectoryRows(dirRows)
    setDirectoryHeaders(headers)
    setUsageCsvText(csv)
    setUsageHeaders(parseCsvText(csv).headers)
    setDirectoryMeta(dirMeta)
    setUsageMeta(useMeta)
  }, [])

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [storedDir, storedUsage, log] = await Promise.all([
        loadStoredFile(SOURCE_FILE_IDS.directory),
        loadStoredFile(SOURCE_FILE_IDS.usage),
        loadUpdateLog(),
      ])
      setUpdateLog(log)

      let dirRows, dirHeaders, dirMeta
      if (storedDir?.rows?.length) {
        dirRows = storedDir.rows
        dirHeaders = storedDir.headers ?? Object.keys(dirRows[0] ?? {})
        dirMeta = { updatedAt: storedDir.updatedAt, source: storedDir.source ?? "saved" }
      } else {
        const buf = await fetchArrayBuffer(SOURCE_FILES.directory.publicPath)
        dirRows = directoryRowsFromXlsx(buf)
        dirHeaders = Object.keys(dirRows[0] ?? {})
        dirMeta = { updatedAt: nowIso(), source: "public" }
      }

      let csv, useMeta
      if (storedUsage?.content) {
        csv = storedUsage.content
        useMeta = { updatedAt: storedUsage.updatedAt, source: storedUsage.source ?? "saved" }
      } else {
        csv = await fetchText(SOURCE_FILES.usage.publicPath)
        useMeta = { updatedAt: nowIso(), source: "public" }
      }

      const processed = processSourceData({ directoryRows: dirRows, csvText: csv })
      applyProcessed(processed, dirRows, dirHeaders, csv, dirMeta, useMeta)
    } catch (err) {
      setError(err.message || "Failed to load source files")
    } finally {
      setLoading(false)
    }
  }, [applyProcessed])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const persistDirectory = useCallback(async (rows, headers, source, action, summary) => {
    const updatedAt = nowIso()
    await saveStoredFile({ id: SOURCE_FILE_IDS.directory, rows, headers, updatedAt, source })
    const csv = usageCsvText
    const processed = processSourceData({ directoryRows: rows, csvText: csv })
    applyProcessed(processed, rows, headers, csv, { updatedAt, source }, usageMeta)
    await appendUpdateLog({ fileId: SOURCE_FILE_IDS.directory, action, summary, timestamp: updatedAt })
    await refreshLog()
  }, [usageCsvText, usageMeta, applyProcessed, refreshLog])

  const persistUsage = useCallback(async (content, source, action, summary) => {
    const updatedAt = nowIso()
    await saveStoredFile({ id: SOURCE_FILE_IDS.usage, content, updatedAt, source })
    const processed = processSourceData({ directoryRows, csvText: content })
    const headers = directoryRows.length ? directoryHeaders : []
    applyProcessed(processed, directoryRows, headers, content, directoryMeta, { updatedAt, source })
    await appendUpdateLog({ fileId: SOURCE_FILE_IDS.usage, action, summary, timestamp: updatedAt })
    await refreshLog()
  }, [directoryRows, directoryHeaders, directoryMeta, applyProcessed, refreshLog])

  const updateDirectoryCell = useCallback(async (rowIndex, column, value) => {
    const next = directoryRows.map((row, i) =>
      i === rowIndex ? { ...row, [column]: value } : row
    )
    await persistDirectory(next, directoryHeaders, "manual-edit", "manual-edit",
      `Edited directory row ${rowIndex + 1}, column “${column}”.`)
  }, [directoryRows, directoryHeaders, persistDirectory])

  const updateUsageCell = useCallback(async (rowIndex, column, value) => {
    const parsed = parseCsvText(usageCsvText)
    const nextRows = parsed.rows.map((row, i) =>
      i === rowIndex ? { ...row, [column]: value } : row
    )
    const content = rowsToCsv(parsed.headers, nextRows)
    await persistUsage(content, "manual-edit", "manual-edit",
      `Edited usage row ${rowIndex + 1}, column “${column}”.`)
  }, [usageCsvText, persistUsage])

  const importFile = useCallback(async (file) => {
    const name = file.name.toLowerCase()
    if (name.endsWith(".csv")) {
      const text = await file.text()
      const parsed = parseCsvText(text)
      await persistUsage(text, "upload", "upload", `Uploaded ${file.name} (${parsed.rows.length} rows).`)
      return SOURCE_FILE_IDS.usage
    }
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const buf = await file.arrayBuffer()
      const rows = directoryRowsFromXlsx(buf)
      const headers = Object.keys(rows[0] ?? {})
      await persistDirectory(rows, headers, "upload", "upload", `Uploaded ${file.name} (${rows.length} rows).`)
      return SOURCE_FILE_IDS.directory
    }
    throw new Error("Unsupported file type. Use .csv or .xlsx")
  }, [persistDirectory, persistUsage])

  const runAiEdit = useCallback(async (prompt) => {
    setAiLoading(true)
    try {
      const result = applySourceDataAi({ prompt, directoryRows, usageCsvText })
      setAiMessage(result.summary)
      if (result.changed) {
        if (result.directoryRows !== directoryRows) {
          await persistDirectory(result.directoryRows, directoryHeaders, "ai", result.logAction, result.summary)
        }
        if (result.usageCsvText !== usageCsvText) {
          await persistUsage(result.usageCsvText, "ai", result.logAction, result.summary)
        }
      } else {
        await appendUpdateLog({ fileId: "both", action: result.logAction, summary: result.summary, timestamp: nowIso() })
        await refreshLog()
      }
    } finally {
      setAiLoading(false)
    }
  }, [directoryRows, directoryHeaders, usageCsvText, persistDirectory, persistUsage, refreshLog])

  const usageRows = useMemo(() => parseCsvText(usageCsvText).rows, [usageCsvText])

  const formatLogTime = useCallback((iso) => {
    try {
      return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      })
    } catch {
      return iso
    }
  }, [])

  const value = useMemo(() => ({
    loading,
    error,
    sourceMode: true,
    ...(measured ?? {}),
    directoryRows,
    directoryHeaders,
    usageCsvText,
    usageHeaders,
    usageRows,
    directoryMeta,
    usageMeta,
    updateLog,
    aiMessage,
    aiLoading,
    updateDirectoryCell,
    updateUsageCell,
    importFile,
    runAiEdit,
    formatLogTime,
    reload: loadInitial,
  }), [
    loading, error, measured, directoryRows, directoryHeaders, usageCsvText,
    usageHeaders, usageRows, directoryMeta, usageMeta, updateLog,
    aiMessage, aiLoading, updateDirectoryCell, updateUsageCell,
    importFile, runAiEdit, formatLogTime, loadInitial,
  ])

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext)
  if (!ctx) {
    throw new Error("useDashboardData must be used within DashboardDataProvider")
  }
  return ctx
}

/** Measured fields with static fallback (for rare cases outside provider). */
export function useMeasuredData() {
  const ctx = useContext(DashboardDataContext)
  if (ctx && !ctx.loading && ctx.KPIs) return ctx
  return {
    loading: ctx?.loading ?? true,
    error: ctx?.error,
    sourceMode: false,
    KPIs: staticData.KPIs,
    DEPT: staticData.DEPT,
    WEEKLY: staticData.WEEKLY,
    TOOL_DATA: staticData.TOOL_DATA,
    LLM_DATA: staticData.LLM_DATA,
    USER_SEGMENTS: staticData.USER_SEGMENTS,
    SENIORITY: staticData.SENIORITY,
    DATA_QUALITY: staticData.DATA_QUALITY,
    PROCESS_MAPS: staticData.PROCESS_MAPS,
    EMPLOYEE_ROSTER: staticData.EMPLOYEE_ROSTER,
    USAGE_RECORDS: staticData.USAGE_RECORDS,
    PROCESS_WEEKS: staticData.PROCESS_WEEKS,
    DEPT_COLORS: staticData.DEPT_COLORS,
    directoryMeta: null,
    usageMeta: null,
    usageRows: [],
  }
}
