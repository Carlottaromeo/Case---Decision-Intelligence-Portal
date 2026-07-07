import { useCallback } from "react"
import ExportShareBar from "./ExportShareBar"
import { exportPageSummaryPdf } from "../utils/pageExport"

export default function PageHeaderActions({
  title,
  subtitle,
  kpis = [],
  extraLines = [],
  onNotify,
}) {
  const handleExport = useCallback(() => {
    exportPageSummaryPdf({
      title,
      subtitle,
      kpis,
      lines: extraLines,
    })
    onNotify?.("PDF downloaded")
  }, [title, subtitle, kpis, extraLines, onNotify])

  return (
    <ExportShareBar
      variant="investment"
      share={{
        title: title ?? "AI Adoption & Investment Hub",
        text: subtitle ?? title,
      }}
      onNotify={onNotify}
      formats={[
        { key: "pdf", label: "Summary (PDF)", onSelect: handleExport },
      ]}
    />
  )
}
