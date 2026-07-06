import { useState, useEffect, useCallback, useMemo } from "react"
import { SOURCE_FILE_IDS, SOURCE_FILES } from "../data/sourceFilesMeta"
import {
  analyzeSourceData,
  fetchArrayBuffer,
  fetchText,
  parseCsvText,
  parseXlsxArray,
  rosterToDirectoryRows,
  rowsToCsv,
} from "../utils/parseSourceFiles"
import { applySourceDataAi } from "../data/sourceDataAi"
import {
  appendUpdateLog,
  loadStoredFile,
  loadUpdateLog,
  saveStoredFile,
} from "../utils/sourceDataStorage"

function nowIso() {
  return new Date().toISOString()
}

function formatLogTime(iso) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function useSourceDataFiles() {
  const [loading, setLoading] = useState(true)
  const [directoryRows, setDirectoryRows] = useState([])
  const [directoryHeaders, setDirectoryHeaders] = useState([])
  const [usageCsvText, setUsageCsvText] = useState("")
  const [usageHeaders, setUsageHeaders] = useState([])
  const [directoryMeta, setDirectoryMeta] = useState({ updatedAt: null, source: "bundled" })
  const [usageMeta, setUsageMeta] = useState({ updatedAt: null, source: "bundled" })
  const [updateLog, setUpdateLog] = useState([])
  const [aiMessage, setAiMessage] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const refreshLog = useCallback(async () => {
    const log = await loadUpdateLog()
    setUpdateLog(log)
  }, [])

  const loadInitial = useCallback(async () => {
    setLoading(true)
    try {
      const [storedDir, storedUsage, log] = await Promise.all([
        loadStoredFile(SOURCE_FILE_IDS.directory),
        loadStoredFile(SOURCE_FILE_IDS.usage),
        loadUpdateLog(),
      ])
      setUpdateLog(log)

      if (storedDir?.rows) {
        setDirectoryRows(storedDir.rows)
        setDirectoryHeaders(storedDir.headers ?? Object.keys(storedDir.rows[0] ?? {}))
        setDirectoryMeta({ updatedAt: storedDir.updatedAt, source: storedDir.source ?? "saved" })
      } else {
        try {
          const buf = await fetchArrayBuffer(SOURCE_FILES.directory.publicPath)
          const parsed = parseXlsxArray(buf)
          setDirectoryRows(parsed.rows)
          setDirectoryHeaders(parsed.headers)
          setDirectoryMeta({ updatedAt: nowIso(), source: "public" })
        } catch {
          const rows = rosterToDirectoryRows()
          setDirectoryRows(rows)
          setDirectoryHeaders(["Employee id", "Department", "Seniority"])
          setDirectoryMeta({ updatedAt: nowIso(), source: "roster-fallback" })
        }
      }

      if (storedUsage?.content) {
        setUsageCsvText(storedUsage.content)
        const parsed = parseCsvText(storedUsage.content)
        setUsageHeaders(parsed.headers)
        setUsageMeta({ updatedAt: storedUsage.updatedAt, source: storedUsage.source ?? "saved" })
      } else {
        const csv = await fetchText(SOURCE_FILES.usage.publicPath)
        setUsageCsvText(csv)
        const parsed = parseCsvText(csv)
        setUsageHeaders(parsed.headers)
        setUsageMeta({ updatedAt: nowIso(), source: "public" })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const metrics = useMemo(
    () => analyzeSourceData(directoryRows, usageCsvText),
    [directoryRows, usageCsvText]
  )

  const persistDirectory = useCallback(async (rows, headers, source, action, summary) => {
    const updatedAt = nowIso()
    await saveStoredFile({
      id: SOURCE_FILE_IDS.directory,
      rows,
      headers,
      updatedAt,
      source,
    })
    setDirectoryRows(rows)
    setDirectoryHeaders(headers)
    setDirectoryMeta({ updatedAt, source })
    await appendUpdateLog({
      fileId: SOURCE_FILE_IDS.directory,
      action,
      summary,
      timestamp: updatedAt,
    })
    await refreshLog()
  }, [refreshLog])

  const persistUsage = useCallback(async (content, source, action, summary) => {
    const updatedAt = nowIso()
    const parsed = parseCsvText(content)
    await saveStoredFile({
      id: SOURCE_FILE_IDS.usage,
      content,
      updatedAt,
      source,
    })
    setUsageCsvText(content)
    setUsageHeaders(parsed.headers)
    setUsageMeta({ updatedAt, source })
    await appendUpdateLog({
      fileId: SOURCE_FILE_IDS.usage,
      action,
      summary,
      timestamp: updatedAt,
    })
    await refreshLog()
  }, [refreshLog])

  const updateDirectoryCell = useCallback(async (rowIndex, column, value) => {
    const next = directoryRows.map((row, i) =>
      i === rowIndex ? { ...row, [column]: value } : row
    )
    await persistDirectory(
      next,
      directoryHeaders,
      "manual-edit",
      `Edited directory row ${rowIndex + 1}, column “${column}”.`
    )
  }, [directoryRows, directoryHeaders, persistDirectory])

  const updateUsageCell = useCallback(async (rowIndex, column, value) => {
    const parsed = parseCsvText(usageCsvText)
    const nextRows = parsed.rows.map((row, i) =>
      i === rowIndex ? { ...row, [column]: value } : row
    )
    const content = rowsToCsv(parsed.headers, nextRows)
    await persistUsage(
      content,
      "manual-edit",
      "manual-edit",
      `Edited usage row ${rowIndex + 1}, column “${column}”.`
    )
  }, [usageCsvText, persistUsage])

  const importFile = useCallback(async (file) => {
    const name = file.name.toLowerCase()
    if (name.endsWith(".csv")) {
      const text = await file.text()
      const parsed = parseCsvText(text)
      await persistUsage(
        text,
        "upload",
        "upload",
        `Uploaded ${file.name} (${parsed.rows.length} rows).`
      )
      return SOURCE_FILE_IDS.usage
    }
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const buf = await file.arrayBuffer()
      const parsed = parseXlsxArray(buf)
      await persistDirectory(
        parsed.rows,
        parsed.headers,
        "upload",
        "upload",
        `Uploaded ${file.name} (${parsed.rows.length} rows).`
      )
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
          await persistDirectory(
            result.directoryRows,
            directoryHeaders,
            "ai",
            result.logAction,
            result.summary
          )
        }
        if (result.usageCsvText !== usageCsvText) {
          await persistUsage(result.usageCsvText, "ai", result.logAction, result.summary)
        }
      } else {
        await appendUpdateLog({
          fileId: "both",
          action: result.logAction,
          summary: result.summary,
          timestamp: nowIso(),
        })
        await refreshLog()
      }
    } finally {
      setAiLoading(false)
    }
  }, [directoryRows, directoryHeaders, usageCsvText, persistDirectory, persistUsage, refreshLog])

  const usageRows = useMemo(() => parseCsvText(usageCsvText).rows, [usageCsvText])

  return {
    loading,
    directoryRows,
    directoryHeaders,
    usageCsvText,
    usageHeaders,
    usageRows,
    directoryMeta,
    usageMeta,
    updateLog,
    metrics,
    aiMessage,
    aiLoading,
    updateDirectoryCell,
    updateUsageCell,
    importFile,
    runAiEdit,
    formatLogTime,
    reload: loadInitial,
  }
}
