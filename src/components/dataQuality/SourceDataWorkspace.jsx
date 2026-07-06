import { useCallback, useState } from "react"
import { SOURCE_FILE_LIST, SOURCE_FILE_IDS } from "../../data/sourceFilesMeta"
import { rowsToCsv, rowsToXlsxBlob } from "../../utils/parseSourceFiles"
import { Card, SH } from "../UI"
import NotificationBanner from "../NotificationBanner"
import SourceFileTable from "./SourceFileTable"
import SourceDataAiPanel from "./SourceDataAiPanel"
import UpdateLogPanel from "./UpdateLogPanel"

function FileDropZone({ onFile, active }) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }, [onFile])

  return (
    <div
      className={`dq-dropzone${dragOver ? " dq-dropzone--active" : ""}${active ? " dq-dropzone--highlight" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="dq-dropzone__icon" aria-hidden="true">↑</div>
      <div className="dq-dropzone__title">Drop .xlsx or .csv here</div>
      <div className="dq-dropzone__sub">Employee directory (Excel) or usage export (CSV)</div>
      <label className="dq-dropzone__browse">
        Browse files
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
            e.target.value = ""
          }}
        />
      </label>
    </div>
  )
}

function FileMetaCard({ file, meta, rowCount, selected, onSelect, onDownload }) {
  return (
    <button
      type="button"
      className={`dq-file-card${selected ? " dq-file-card--active" : ""}`}
      onClick={onSelect}
    >
      <div className="dq-file-card__type">{file.type.toUpperCase()}</div>
      <div className="dq-file-card__name">{file.label}</div>
      <div className="dq-file-card__filename">{file.filename}</div>
      <div className="dq-file-card__meta">
        {rowCount.toLocaleString()} rows
        {meta?.updatedAt && (
          <> · Updated {new Date(meta.updatedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</>
        )}
      </div>
      <div className="dq-file-card__source">Source: {meta?.source ?? "—"}</div>
      <span
        role="button"
        tabIndex={0}
        className="dq-file-card__download"
        onClick={(e) => { e.stopPropagation(); onDownload() }}
        onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onDownload() } }}
      >
        Download
      </span>
    </button>
  )
}

export default function SourceDataWorkspace({ sourceData }) {
  const [activeFile, setActiveFile] = useState(SOURCE_FILE_IDS.directory)
  const [page, setPage] = useState(0)
  const [importError, setImportError] = useState("")
  const PAGE_SIZE = 40

  const {
    loading,
    directoryRows,
    directoryHeaders,
    usageRows,
    usageHeaders,
    directoryMeta,
    usageMeta,
    updateLog,
    updateDirectoryCell,
    updateUsageCell,
    importFile,
    runAiEdit,
    aiMessage,
    aiLoading,
    formatLogTime,
  } = sourceData

  const handleImport = async (file) => {
    setImportError("")
    try {
      const id = await importFile(file)
      setActiveFile(id)
      setPage(0)
    } catch (err) {
      setImportError(err.message || "Import failed")
    }
  }

  const isDirectory = activeFile === SOURCE_FILE_IDS.directory
  const headers = isDirectory ? directoryHeaders : usageHeaders
  const allRows = isDirectory ? directoryRows : usageRows
  const pageCount = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE))
  const rows = allRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (loading) {
    return <div className="dq-loading">Loading source files…</div>
  }

  return (
    <div className="dq-workspace">
      <FileDropZone onFile={handleImport} />
      {importError && (
        <NotificationBanner
          type="error"
          message={importError}
          className="dq-error dq-error-banner"
        />
      )}

      <div className="dq-workspace__files">
        {SOURCE_FILE_LIST.map((file) => (
          <FileMetaCard
            key={file.id}
            file={file}
            meta={file.id === SOURCE_FILE_IDS.directory ? directoryMeta : usageMeta}
            rowCount={file.id === SOURCE_FILE_IDS.directory ? directoryRows.length : usageRows.length}
            selected={activeFile === file.id}
            onSelect={() => { setActiveFile(file.id); setPage(0) }}
            onDownload={() => {
              if (file.id === SOURCE_FILE_IDS.directory) {
                const blob = rowsToXlsxBlob(directoryRows, directoryHeaders)
                const a = document.createElement("a")
                a.href = URL.createObjectURL(blob)
                a.download = file.filename
                a.click()
                URL.revokeObjectURL(a.href)
              } else {
                const content = rowsToCsv(usageHeaders, usageRows)
                const blob = new Blob([content], { type: "text/csv" })
                const a = document.createElement("a")
                a.href = URL.createObjectURL(blob)
                a.download = file.filename
                a.click()
                URL.revokeObjectURL(a.href)
              }
            }}
          />
        ))}
      </div>

      <div className="dq-workspace__grid">
        <Card className="dq-editor-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <SH
              title={SOURCE_FILE_LIST.find((f) => f.id === activeFile)?.label}
              sub="Click a cell to edit · changes are saved locally and logged"
            />
            <div className="dq-pagination">
              <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
              <span>{page + 1} / {pageCount}</span>
              <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
          <SourceFileTable
            headers={headers}
            rows={rows}
            rowOffset={page * PAGE_SIZE}
            onEdit={isDirectory ? updateDirectoryCell : updateUsageCell}
          />
        </Card>

        <div className="dq-workspace__side">
          <SourceDataAiPanel
            onRun={runAiEdit}
            message={aiMessage}
            loading={aiLoading}
          />
          <UpdateLogPanel log={updateLog} formatTime={formatLogTime} />
        </div>
      </div>
    </div>
  )
}
